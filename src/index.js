require("./models/User");
require("./models/Track");
const connectDB = require('./db');
const app = require('./app');

require('dotenv').config();

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
