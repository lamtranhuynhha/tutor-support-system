import { Router } from "express";
import {login, logout} from "../controllers/auth.controller.js";

export const router = Router();

// DEFINE ROUTES HERE
router.post("/login", login);
router.post("/logout", logout);
// router post /change-password
// router post /forgot-password
// Example:
// router.post("/register", <middleware> ,register);

