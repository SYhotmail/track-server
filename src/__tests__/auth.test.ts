import request from 'supertest';
import app from '../app.js';

describe('Auth Routes', () => {
  it('should signup a user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200);

    expect(res.body.token).toBeDefined();
  });

  it('should signin a user', async () => {
    // First signup
    await request(app)
      .post('/signup')
      .send({ email: 'signin@test.com', password: 'password' });

    // Then signin
    const res = await request(app)
      .post('/signin')
      .send({ email: 'signin@test.com', password: 'password' })
      .expect(200);

    expect(res.body.token).toBeDefined();
  });

  it('should not signin with wrong password', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'wrong@test.com', password: 'password' });

    await request(app)
      .post('/signin')
      .send({ email: 'wrong@test.com', password: 'wrong' })
      .expect(422);
  });

  it('should signin using an existing valid token', async () => {
    const signupRes = await request(app)
      .post('/signup')
      .send({ email: 'token@test.com', password: 'password' })
      .expect(200);

    const token = signupRes.body.token;

    const res = await request(app)
      .post('/signin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.token).toBe(token);
  });
});