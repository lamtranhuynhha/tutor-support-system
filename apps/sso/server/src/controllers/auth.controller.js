import { asyncHandler } from "@shared/utils/asyncHandler";
import { authService } from "../services/auth.service.js";
import { AppError } from "@shared/utils/AppError";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24g
  path: '/',
};

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Please provide both username and password', 400);
  }

  const { user } = await authService.login({ 
    username, 
    password,
    req
  });

  res.status(200).json({success: true, data: {user}});
});

export const changePassword = asyncHandler(async (req, res) => {
  // YOUR CODE HERE
});

export const resetPassword = asyncHandler(async (req, res) => {
  // YOUR CODE HERE
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req);
  
  res.clearCookie('connect.sid', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.status(200).json({success: true, message: 'Successfully logged out'});
});
