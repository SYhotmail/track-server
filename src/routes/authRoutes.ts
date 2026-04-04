import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/signup', async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  try {
    const user = new User({ email, password });
    const refreshToken = jwt.sign({ userId: user._id }, 'REFRESH_SECRET_KEY');
    user.refreshToken = refreshToken;
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY', { expiresIn: '15m' });
    res.send({ token, refreshToken });
  } catch (err) {
    return res.status(422).send((err as Error).message);
  }
});

router.post('/signin', async (req: express.Request, res: express.Response) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, 'MY_SECRET_KEY') as { userId: string };
      const user = await User.findById(payload.userId);

      if (!user) {
        return res.status(422).send({ error: 'Invalid token' });
      }

      return res.send({ token });
    } catch (err) {
      return res.status(401).send({ error: 'Invalid token' });
    }
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, 'REFRESH_SECRET_KEY');
    user.refreshToken = refreshToken;
    await user.save();
    res.send({ token, refreshToken });
  } catch (err) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
});

router.post('/refresh', async (req: express.Request, res: express.Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, 'REFRESH_SECRET_KEY') as { userId: string };
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).send({ error: 'Invalid refresh token' });
    }

    const newToken = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY', { expiresIn: '15m' });
    res.send({ token: newToken });
  } catch (err) {
    return res.status(401).send({ error: 'Invalid refresh token' });
  }
});

export default router;
