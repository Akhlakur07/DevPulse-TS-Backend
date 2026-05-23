import type { SignupRequestBody, LoginRequestBody } from "../modules/auth/auth.types.js";
import type { CreateIssueBody, UpdateIssueBody } from "../modules/issues/issues.types.js";

/** Simple email format validation */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate signup request body.
 * Returns an array of error messages (empty if valid).
 */
export function validateSignup(body: Partial<SignupRequestBody>): string[] {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!body.email || typeof body.email !== "string" || body.email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!isValidEmail(body.email)) {
    errors.push("Invalid email format");
  }

  if (!body.password || typeof body.password !== "string" || body.password.trim().length === 0) {
    errors.push("Password is required");
  }

  if (body.role !== undefined && body.role !== "contributor" && body.role !== "maintainer") {
    errors.push("Role must be 'contributor' or 'maintainer'");
  }

  return errors;
}

/**
 * Validate login request body.
 * Returns an array of error messages (empty if valid).
 */
export function validateLogin(body: Partial<LoginRequestBody>): string[] {
  const errors: string[] = [];

  if (!body.email || typeof body.email !== "string" || body.email.trim().length === 0) {
    errors.push("Email is required");
  }

  if (!body.password || typeof body.password !== "string" || body.password.trim().length === 0) {
    errors.push("Password is required");
  }

  return errors;
}

/**
 * Validate create issue request body.
 * Enforces: title max 150 chars, description min 20 chars, type must be bug or feature_request.
 */
export function validateCreateIssue(body: Partial<CreateIssueBody>): string[] {
  const errors: string[] = [];

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (body.title.length > 150) {
    errors.push("Title must be 150 characters or less");
  }

  if (!body.description || typeof body.description !== "string" || body.description.trim().length === 0) {
    errors.push("Description is required");
  } else if (body.description.length < 20) {
    errors.push("Description must be at least 20 characters");
  }

  if (!body.type || typeof body.type !== "string") {
    errors.push("Type is required");
  } else if (body.type !== "bug" && body.type !== "feature_request") {
    errors.push("Type must be 'bug' or 'feature_request'");
  }

  return errors;
}

/**
 * Validate update issue request body.
 * All fields are optional, but when present they must meet the same constraints as creation.
 */
export function validateUpdateIssue(body: Partial<UpdateIssueBody>): string[] {
  const errors: string[] = [];

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      errors.push("Title cannot be empty");
    } else if (body.title.length > 150) {
      errors.push("Title must be 150 characters or less");
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.trim().length === 0) {
      errors.push("Description cannot be empty");
    } else if (body.description.length < 20) {
      errors.push("Description must be at least 20 characters");
    }
  }

  if (body.type !== undefined) {
    if (body.type !== "bug" && body.type !== "feature_request") {
      errors.push("Type must be 'bug' or 'feature_request'");
    }
  }

  return errors;
}
