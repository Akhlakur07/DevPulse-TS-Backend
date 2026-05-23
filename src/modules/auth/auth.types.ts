/** Represents a row from the users table */
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

/** Request body for POST /api/auth/signup */
export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
}

/** Request body for POST /api/auth/login */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/** JWT token payload — stored inside the signed token */
export interface JwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}
