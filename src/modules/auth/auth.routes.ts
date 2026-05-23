import { Router } from "express";
import { signup, login } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/login", login);

export default authRouter;
