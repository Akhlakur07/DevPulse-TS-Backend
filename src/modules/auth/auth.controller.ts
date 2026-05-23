import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../config/db.js";
import { env } from "../../config/env.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { validateSignup, validateLogin } from "../../utils/validate.js";
import type { UserRow } from "./auth.types.js";

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/signup
 * Register a new user account. Hashes password with bcrypt before storage.
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    // Validate request body
    const errors = validateSignup({ name, email, password, role });
    if (errors.length > 0) {
      sendError(res, 400, "Validation failed", errors);
      return;
    }

    // Check if email already exists
    const existingUser = await query<UserRow>(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      sendError(res, 400, "Email already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const result = await query<UserRow>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role || "contributor"]
    );

    const user = result.rows[0];

    sendSuccess(res, 201, "User registered successfully", {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      created_at: user!.created_at,
      updated_at: user!.updated_at,
    });
  } catch (error) {
    console.error("Signup error:", error);
    sendError(res, 500, "Internal server error");
  }
}

/**
 * POST /api/auth/login
 * Authenticate user credentials and return a signed JWT token.
 * JWT payload includes: id, name, role (used for downstream authorization).
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate request body
    const errors = validateLogin({ email, password });
    if (errors.length > 0) {
      sendError(res, 400, "Validation failed", errors);
      return;
    }

    // Find user by email
    const result = await query<UserRow>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      sendError(res, 400, "Invalid email or password");
      return;
    }

    const user = result.rows[0]!;

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendError(res, 400, "Invalid email or password");
      return;
    }

    // Sign JWT with user info
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    sendSuccess(res, 200, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, 500, "Internal server error");
  }
}
