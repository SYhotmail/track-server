import express from 'express';
import requireAuth from '../middlewares/requireAuth.js';
import Track from '../models/Track.js';

const router = express.Router();

router.use(requireAuth);

router.get('/tracks', async (req: express.Request, res: express.Response) => {
  const tracks = await Track.find({ userId: (req as any).user._id });

  res.send(tracks);
});

router.post('/tracks', async (req: express.Request, res: express.Response) => {
  const { name, locations } = req.body;

  if (!name || !locations) {
    return res
      .status(422)
      .send({ error: 'You must provide a name and locations' });
  }

  try {
    const track = new Track({ name, locations, userId: (req as any).user._id });
    await track.save();
    res.send(track);
  } catch (err) {
    res.status(422).send({ error: (err as Error).message });
  }
});

export default router;
