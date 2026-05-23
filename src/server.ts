import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { initDb } from "./config/initDb.js";
import authRouter from "./modules/auth/auth.routes.js";
import issuesRouter from "./modules/issues/issues.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API is running",
    author: "DevPulse",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.use(errorHandler);
initDb()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`DevPulse server running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

export default app;
