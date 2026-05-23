import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err.message);

  sendError(res, 500, "Internal server error", err.message);
}
