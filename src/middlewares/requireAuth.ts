import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: 'You must be logged in.' });
  }

  const token = authorization.replace('Bearer ', '');
  
  // Decode token to get expiry info (without verification)
  const decoded = jwt.decode(token) as JwtPayload;
  if (decoded && decoded.exp) {
    const expiresIn = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    res.set('X-Token-Expires-In', expiresIn.toString());
  }
  
  jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: 'You must be logged in.' });
    }

    const { userId } = payload as JwtPayload & { userId: string };
    const user = await User.findById(userId);
    (req as any).user = user;
    next();
  });
};

export default requireAuth;
