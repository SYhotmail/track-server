import mongoose from 'mongoose';

interface Point {
  timestamp: number;
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
  };
}

interface Track {
  userId: mongoose.Types.ObjectId;
  name: string;
  locations: Point[];
}

const pointSchema = new mongoose.Schema<Point>({
  timestamp: Number,
  coords: {
    latitude: Number,
    longitude: Number,
    altitude: Number,
    accuracy: Number,
    heading: Number,
    speed: Number
  }
});

const trackSchema = new mongoose.Schema<Track>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    default: ''
  },
  locations: [pointSchema]
});

const Track = mongoose.model<Track>('Track', trackSchema);

export default Track;
