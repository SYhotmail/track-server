import 'dotenv/config';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error(
    `MongoURI was not supplied. Make sure MONGO_URI is set in your .env file!`
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