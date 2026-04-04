import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';

const getErrorMessage = (devMessage: string): string => {
  return process.env.NODE_ENV === 'development' ? devMessage : 'Unauthorized';
};

const sendAuthError = (res: Response, devMessage: string) => {
  return res.status(401).send({ error: getErrorMessage(devMessage) });
};

const hasExpiration = (payload: JwtPayload | string | undefined): payload is JwtPayload => {
  return typeof payload !== 'string' && payload !== undefined && typeof payload.exp === 'number';
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return sendAuthError(res, 'You must be logged in.');
  }

  const token = authorization.replace('Bearer ', '');

  jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return sendAuthError(res, 'Token has expired.');
      }

      return sendAuthError(res, 'Invalid token signature.');
    }

    if (!hasExpiration(payload)) {
      return sendAuthError(res, 'Token expiration is missing.');
    }

    const { userId } = payload as JwtPayload & { userId: string };
    const user = await User.findById(userId);
    
    if (!user) {
      return sendAuthError(res, 'User not found.');
    }
    
    if (!user.refreshToken) {
      return sendAuthError(res, 'Invalid session.');
    }
    
    // Verify refresh token is valid
    try {
      jwt.verify(user.refreshToken, 'REFRESH_SECRET_KEY');
    } catch (refreshErr) {
      return sendAuthError(res, 'Invalid refresh token.');
    }
    
    (req as any).user = user;
    next();
  });
};

export default requireAuth;
