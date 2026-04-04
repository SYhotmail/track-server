import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface User {
  email: string;
  password: string;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<User>({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  }
});

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword: string) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};

const User = mongoose.model<User>('User', userSchema);

export default User;
