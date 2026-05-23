import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: number;
}

/**
 * Validates and exports all required environment variables.
 * Throws an error at startup if any required variable is missing.
 */
function loadEnv(): EnvConfig {
  const { DATABASE_URL, JWT_SECRET, PORT } = process.env;

  if (!DATABASE_URL) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }

  if (!JWT_SECRET) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }

  return {
    DATABASE_URL,
    JWT_SECRET,
    PORT: PORT ? parseInt(PORT, 10) : 5000,
  };
}

export const env = loadEnv();
