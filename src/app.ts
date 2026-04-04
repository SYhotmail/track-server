import './models/User.js';
import './models/Track.js';

import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import requireAuth from './middlewares/requireAuth.js';

const app = express();

app.use(bodyParser.json());
app.use(authRoutes);
app.use(trackRoutes);

app.get("/", requireAuth, (req, res) => {
  res.send(`Your email: ${(req as any).user.email}`);
});

export default app;