import 'dotenv/config';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const mongoUri = `mongodb+srv://yakushevichsv_db_user:${process.env.DB_PASSWORD}@cluster0.nwugnmg.mongodb.net/?appName=Cluster0`;

if (!mongoUri) {
  throw new Error(
    `MongoURI was not supplied.  Make sure you watch the video on setting up Mongo DB!`
  );
}

const connectDB = () => {
  return new Promise<void>((resolve, reject) => {
    mongoose.connect(mongoUri);
    mongoose.connection.on('connected', () => {
      console.log('Connected to mongo instance');
      resolve();
    });
    mongoose.connection.on('error', (err) => {
      console.error('Error connecting to mongo', err);
      reject(err);
    });
  });
};

export default connectDB;