import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { env } from "./env.js";

// Create a single connection pool instance for the entire application
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

/**
 * Helper function to execute SQL queries using the connection pool.
 * Wraps pool.query() for consistent usage across the application.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;
