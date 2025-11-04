import { User } from "../models/user.model.js";
import { AppError } from "@shared/utils/AppError";

export const authService = {
  async login({ username, password, req }) {
    const user = await User.findOne({ username });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // allow 3 failed attempts
    if (user.failedLoginCount >= 3) {
      throw new AppError('Too many failed attempts. Account locked', 423);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.failedLoginCount += 1;
      await user.save();
      
      const remainingAttempts = 3 - user.failedLoginCount;
      const message = remainingAttempts > 0 
        ? `Wrong password. ${remainingAttempts} attempts remaining.`
        : 'Account locked. Please reset your password.';
      
      throw new AppError(message, 401);
    }

    if (user.failedLoginCount > 0) {
      user.failedLoginCount = 0;
      await user.save();
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    };

    // Save the session (this will create/update it in Redis via connect-redis)
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    const userData = user.toObject();
    delete userData.password;
    delete userData.failedLoginCount;

    return { user: userData };
  },
  
  async logout(req) {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          console.error('Error during logout:', err);
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  },
  
  async changePassword({ username, currentPassword, newPassword }) {
    // Implementation for password change
  },
  
  async resetPassword({ email }) {
    // Implementation for password reset
  }
};
