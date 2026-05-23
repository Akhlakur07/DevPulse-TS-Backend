import { Router } from "express";
import { signup, login } from "./auth.controller.js";

const authRouter = Router();

// POST /api/auth/signup — Register a new user
authRouter.post("/signup", signup);

// POST /api/auth/login — Authenticate and get JWT
authRouter.post("/login", login);

export default authRouter;
