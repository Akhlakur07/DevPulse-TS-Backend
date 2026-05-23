export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
}
export interface LoginRequestBody {
  email: string;
  password: string;
}
export interface JwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}
