const request = require('supertest');
const app = require('../app');

describe('Track Routes', () => {
  let token;

  beforeEach(async () => {
    // Signup and signin to get token
    await request(app)
      .post('/signup')
      .send({ email: 'trackuser@test.com', password: 'password' });

    const res = await request(app)
      .post('/signin')
      .send({ email: 'trackuser@test.com', password: 'password' });

    token = res.body.token;
  });

  it('should create a track', async () => {
    const res = await request(app)
      .post('/tracks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Track',
        locations: [{ timestamp: Date.now(), coords: { latitude: 37.7749, longitude: -122.4194 } }]
      })
      .expect(200);

    expect(res.body.name).toBe('Test Track');
    expect(res.body._id).toBeDefined();
  });

  it('should get tracks', async () => {
    // Create a track first
    await request(app)
      .post('/tracks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'My Track',
        locations: [{ timestamp: Date.now(), coords: { latitude: 40.7128, longitude: -74.0060 } }]
      });

    const res = await request(app)
      .get('/tracks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('My Track');
  });

  it('should require auth for tracks', async () => {
    await request(app)
      .get('/tracks')
      .expect(401);
  });
});