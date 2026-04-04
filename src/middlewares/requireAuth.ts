import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';

const getErrorMessage = (devMessage: string): string => {
  return process.env.NODE_ENV === 'development' ? devMessage : 'Unauthorized';
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: getErrorMessage('You must be logged in.') });
  }

  const token = authorization.replace('Bearer ', '');
  jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: getErrorMessage('You must be logged in.') });
    }

    const { userId } = payload as JwtPayload & { userId: string };
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).send({ error: getErrorMessage('User not found.') });
    }
    
    if (!user.refreshToken) {
      return res.status(401).send({ error: getErrorMessage('Invalid session.') });
    }
    
    // Verify refresh token is valid
    try {
      jwt.verify(user.refreshToken, 'REFRESH_SECRET_KEY');
    } catch (refreshErr) {
      return res.status(401).send({ error: getErrorMessage('Invalid refresh token.') });
    }
    
    (req as any).user = user;
    next();
  });
};

export default requireAuth;
