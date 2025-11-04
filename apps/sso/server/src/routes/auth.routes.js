import { Router } from "express";
// import {register,...} from "../controllers/auth.controller.js";
import { login, resetPassword } from "../controllers/auth.controller.js";
import { requireAuth } from "@tss/middlewares/auth";
//import { validate } from "../middlewares/validate.middleware.js";

export const router = Router();

// DEFINE ROUTES HERE
router.post("/login", login);
// router post /change-password
// router post /forgot-password
// Example:
// router.post("/register", <middleware> ,register);

