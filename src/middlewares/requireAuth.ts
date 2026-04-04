import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: 'You must be logged in.' });
  }

  const token = authorization.replace('Bearer ', '');
  jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
    if (err) {
      // Try as refresh token
      jwt.verify(token, 'REFRESH_SECRET_KEY', async (refreshErr, refreshPayload) => {
        if (refreshErr) {
          return res.status(401).send({ error: 'Invalid token.' });
        }
        
        const user = await User.findById((refreshPayload as JwtPayload).userId);
        if (!user || user.refreshToken !== token) {
          return res.status(401).send({ error: 'Invalid refresh token.' });
        }
        
        (req as any).user = user;
        next();
      });
    } else {
      const user = await User.findById((payload as JwtPayload).userId);
      (req as any).user = user;
      next();
    }
  });
};

export default requireAuth;
