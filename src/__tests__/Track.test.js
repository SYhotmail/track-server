const Track = require('../models/Track');
const User = require('../models/User');

describe('Track Model', () => {
  let user;

  beforeEach(async () => {
    user = new User({
      email: 'trackuser@example.com',
      password: 'password123'
    });
    await user.save();
  });

  it('should create a track', async () => {
    const track = new Track({
      name: 'Test Track',
      locations: [{ timestamp: Date.now(), coords: { latitude: 37.7749, longitude: -122.4194 } }],
      userId: user._id
    });
    const savedTrack = await track.save();
    expect(savedTrack.name).toBe('Test Track');
    expect(savedTrack.locations).toHaveLength(1);
  });

  it('should find tracks by userId', async () => {
    const track = new Track({
      name: 'User Track',
      locations: [{ timestamp: Date.now(), coords: { latitude: 40.7128, longitude: -74.0060 } }],
      userId: user._id
    });
    await track.save();
    const tracks = await Track.find({ userId: user._id });
    expect(tracks).toHaveLength(1);
    expect(tracks[0].name).toBe('User Track');
  });
});