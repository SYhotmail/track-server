import './models/User.js';
import './models/Track.js';
import connectDB from './db.js';
import app from './app.js';

import 'dotenv/config';

(async () => {
  try {
    await connectDB();

    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  } catch (err) {
    console.error('Failed to connect to DB', err);
  }
})();
