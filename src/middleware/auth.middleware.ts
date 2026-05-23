import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sendError } from "../utils/response.js";
import type { JwtPayload } from "../modules/auth/auth.types.js";

/**
 * Extend Express Request to include the decoded user from JWT.
 * This allows downstream handlers to access req.user safely.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware.
 * Verifies the JWT from the Authorization header and attaches decoded payload to req.user.
 * Token format: Authorization: <token>
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    sendError(res, 401, "Access denied. No token provided");
    return;
  }

  // Support both "Bearer <token>" and raw "<token>" formats
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    sendError(res, 401, "Invalid or expired token");
  }
}

/**
 * Authorization middleware factory.
 * Returns a middleware that checks if the authenticated user has one of the allowed roles.
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, "Access denied. No token provided");
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, "Access denied. Insufficient permissions");
      return;
    }

    next();
  };
}
