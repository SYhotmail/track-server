const User = require('../models/User');

describe('User Model', () => {
  it('should create a user', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123'
    });
    const savedUser = await user.save();
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.password).not.toBe('password123'); // should be hashed
  });

  it('should find a user by email', async () => {
    const user = new User({
      email: 'find@example.com',
      password: 'password123'
    });
    await user.save();
    const foundUser = await User.findOne({ email: 'find@example.com' });
    expect(foundUser).toBeTruthy();
    expect(foundUser.email).toBe('find@example.com');
  });
});