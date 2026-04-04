import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';

describe('Auth Routes', () => {
  it('should signup a user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
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
    expect(res.body.refreshToken).toBeDefined();
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

  it('should refresh token', async () => {
    const signupRes = await request(app)
      .post('/signup')
      .send({ email: 'refresh@test.com', password: 'password' })
      .expect(200);

    const refreshToken = signupRes.body.refreshToken;

    const res = await request(app)
      .post('/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should logout and invalidate refresh token', async () => {
    const signupRes = await request(app)
      .post('/signup')
      .send({ email: 'logout@test.com', password: 'password' })
      .expect(200);

    const token = signupRes.body.token;
    const refreshToken = signupRes.body.refreshToken;

    // Logout
    await request(app)
      .post('/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Try to refresh with old refresh token - should fail
    await request(app)
      .post('/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('should invalidate previous refresh token on second signin', async () => {
    // Signup
    await request(app)
      .post('/signup')
      .send({ email: 'double@test.com', password: 'password' })
      .expect(200);

    // First signin
    const firstSignin = await request(app)
      .post('/signin')
      .send({ email: 'double@test.com', password: 'password' })
      .expect(200);

    const firstRefreshToken = firstSignin.body.refreshToken;

    // Second signin
    const secondSignin = await request(app)
      .post('/signin')
      .send({ email: 'double@test.com', password: 'password' })
      .expect(200);

    const secondRefreshToken = secondSignin.body.refreshToken;

    // Try to refresh with first refresh token - should fail
    await request(app)
      .post('/refresh')
      .send({ refreshToken: firstRefreshToken })
      .expect(401);

    // Refresh with second refresh token - should succeed
    const refreshRes = await request(app)
      .post('/refresh')
      .send({ refreshToken: secondRefreshToken })
      .expect(200);

    expect(refreshRes.body.token).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeDefined();
  });

  it('should succeed with previous token on second signin', async () => {
    // Signup
    await request(app)
      .post('/signup')
      .send({ email: 'double@test.com', password: 'password' })
      .expect(200);

    // First signin
    const firstSignin = await request(app)
      .post('/signin')
      .send({ email: 'double@test.com', password: 'password' })
      .expect(200);

    const firstToken = firstSignin.body.token;

    const secondSignin = await request(app)
      .post('/signin')
      .send({ email: 'double@test.com', password: 'password' })
      .expect(200);
    
    const secondToken = secondSignin.body.token;

    await request(app)
        .get("/") 
        .set('Authorization', `Bearer ${firstToken}`)
        .expect(200);

    await request(app)
        .get("/") 
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

  });

  it('should reject expired access tokens', async () => {
    // Create a user first
    await request(app)
      .post('/signup')
      .send({ email: 'expired@test.com', password: 'password' })
      .expect(200);

    // Create an expired token manually (expires immediately)
    const expiredToken = jwt.sign(
      { userId: 'someUserId' }, 
      'MY_SECRET_KEY', 
      { expiresIn: '-1s' } // Already expired
    );

    // Try to access protected route with expired token
    await request(app)
      .get("/")
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject access when stored refresh token is expired', async () => {
    // Create a user and get tokens
    const signupRes = await request(app)
      .post('/signup')
      .send({ email: 'expired-refresh@test.com', password: 'password' })
      .expect(200);

    const validToken = signupRes.body.token;

    // Manually update the user's refresh token to be expired
    // Find the user
    const user = await User.findOne({ email: 'expired-refresh@test.com' });
    
    // Create an expired refresh token
    const expiredRefreshToken = jwt.sign(
      { userId: user!._id.toString(), rand: Math.random() },
      'REFRESH_SECRET_KEY',
      { expiresIn: '-1s' } // Already expired
    );
    
    // Update the user's refresh token in database
    user!.refreshToken = expiredRefreshToken;
    await user!.save();

    // Try to access protected route with valid access token
    // Should fail because refresh token is expired
    await request(app)
      .get("/")
      .set('Authorization', `Bearer ${validToken}`)
      .expect(401);
  });

  it('should cancel signin when access token is expired', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'expired-signin@test.com', password: 'password' })
      .expect(200);

    const user = await User.findOne({ email: 'expired-signin@test.com' });
    const expiredToken = jwt.sign(
      { userId: user!._id.toString() },
      'MY_SECRET_KEY',
      { expiresIn: '-1s' }
    );

    await request(app)
      .post('/signin')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject signin when token has no expiration claim', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'signin-no-exp@test.com', password: 'password' })
      .expect(200);

    const user = await User.findOne({ email: 'signin-no-exp@test.com' });
    const tokenWithoutExp = jwt.sign(
      { userId: user!._id.toString() },
      'MY_SECRET_KEY'
    );

    await request(app)
      .post('/signin')
      .set('Authorization', `Bearer ${tokenWithoutExp}`)
      .expect(401);
  });

  it('should reject protected route when token has no expiration claim', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'auth-no-exp@test.com', password: 'password' })
      .expect(200);

    const user = await User.findOne({ email: 'auth-no-exp@test.com' });
    const tokenWithoutExp = jwt.sign(
      { userId: user!._id.toString() },
      'MY_SECRET_KEY'
    );

    await request(app)
      .get("/")
      .set('Authorization', `Bearer ${tokenWithoutExp}`)
      .expect(401);
  });
});
