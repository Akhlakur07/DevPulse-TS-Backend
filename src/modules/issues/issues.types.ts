/** Represents a row from the issues table */
export interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

/** Request body for POST /api/issues */
export interface CreateIssueBody {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

/** Request body for PATCH /api/issues/:id */
export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
}

/** Query parameters for GET /api/issues */
export interface IssueQueryParams {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

/** Reporter info embedded in issue responses (fetched separately, no JOINs) */
export interface ReporterInfo {
  id: number;
  name: string;
  role: string;
}
