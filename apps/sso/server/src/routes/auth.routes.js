import { Router } from "express";
import {
  login,
  logout,
  changePassword,
  resetPassword,
  resetPasswordToken,
} from "../controllers/auth.controller.js";
import { validateLogin } from "../middlewares/validate.middleware.js";

export const router = Router();

// DEFINE ROUTES HERE
router.post("/login", validateLogin, login);
router.post("/logout", logout);
// router post /change-password
// router post /forgot-password
// Example:
// router.post("/register", <middleware> ,register);
