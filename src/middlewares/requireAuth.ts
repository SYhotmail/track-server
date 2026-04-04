import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    const errorMsg = process.env.NODE_ENV === 'development' ? 'You must be logged in.' : 'Unauthorized';
    return res.status(401).send({ error: errorMsg });
  }

  const token = authorization.replace('Bearer ', '');
  jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
    if (err) {
      const errorMsg = process.env.NODE_ENV === 'development' ? 'You must be logged in.' : 'Unauthorized';
      return res.status(401).send({ error: errorMsg });
    }

    const { userId } = payload as JwtPayload & { userId: string };
    const user = await User.findById(userId);
    
    if (!user) {
      const errorMsg = process.env.NODE_ENV === 'development' ? 'User not found.' : 'Unauthorized';
      return res.status(401).send({ error: errorMsg });
    }
    
    if (!user.refreshToken) {
      const errorMsg = process.env.NODE_ENV === 'development' ? 'Invalid session.' : 'Unauthorized';
      return res.status(401).send({ error: errorMsg });
    }
    
    (req as any).user = user;
    next();
  });
};

export default requireAuth;
