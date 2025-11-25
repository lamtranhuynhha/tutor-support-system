import { body, validationResult } from "express-validator";
import { AppError } from "@shared/utils/AppError";

export const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((err) => err.msg)
        .join(", ");
      throw new AppError(errorMessages, 400);
    }
    next();
  },
];
