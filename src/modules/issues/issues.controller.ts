import type { Request, Response } from "express";
import { query } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { validateCreateIssue, validateUpdateIssue } from "../../utils/validate.js";
import type { IssueRow, ReporterInfo } from "./issues.types.js";
import type { UserRow } from "../auth/auth.types.js";

export async function createIssue(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, type } = req.body;

    const errors = validateCreateIssue({ title, description, type });
    if (errors.length > 0) {
      sendError(res, 400, "Validation failed", errors);
      return;
    }

    const reporterId = req.user!.id;

    const result = await query<IssueRow>(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, type, reporterId]
    );

    const issue = result.rows[0]!;

    sendSuccess(res, 201, "Issue created successfully", issue);
  } catch (error) {
    console.error("Create issue error:", error);
    sendError(res, 500, "Internal server error");
  }
}

export async function getAllIssues(req: Request, res: Response): Promise<void> {
  try {
    const { sort, type, status } = req.query;

    let sql = "SELECT * FROM issues";
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (type && (type === "bug" || type === "feature_request")) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (status && (status === "open" || status === "in_progress" || status === "resolved")) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    const sortOrder = sort === "oldest" ? "ASC" : "DESC";
    sql += ` ORDER BY created_at ${sortOrder}`;

    const issuesResult = await query<IssueRow>(sql, params);
    const issues = issuesResult.rows;

    if (issues.length === 0) {
      sendSuccess(res, 200, "Issues retrived successfully", []);
      return;
    }
    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
    const placeholders = reporterIds.map((_, i) => `$${i + 1}`).join(", ");
    const reportersResult = await query<UserRow>(
      `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
      reporterIds
    );

    const reporterMap = new Map<number, ReporterInfo>();
    for (const reporter of reportersResult.rows) {
      reporterMap.set(reporter.id, {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role,
      });
    }

    const issuesWithReporter = issues.map((issue) => {
      const reporter = reporterMap.get(issue.reporter_id);
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter || null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
    });

    sendSuccess(res, 200, "Issues retrived successfully", issuesWithReporter);
  } catch (error) {
    console.error("Get all issues error:", error);
    sendError(res, 500, "Internal server error");
  }
}

export async function getIssueById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const issueResult = await query<IssueRow>(
      "SELECT * FROM issues WHERE id = $1",
      [Number(id)]
    );

    if (issueResult.rows.length === 0) {
      sendError(res, 404, "Issue not found");
      return;
    }

    const issue = issueResult.rows[0]!;

    const reporterResult = await query<UserRow>(
      "SELECT id, name, role FROM users WHERE id = $1",
      [issue.reporter_id]
    );

    const reporter = reporterResult.rows[0];

    sendSuccess(res, 200, "Issue retrived successfully", {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporter
        ? { id: reporter.id, name: reporter.name, role: reporter.role }
        : null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  } catch (error) {
    console.error("Get issue by id error:", error);
    sendError(res, 500, "Internal server error");
  }
}

export async function updateIssue(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body;

    const errors = validateUpdateIssue({ title, description, type });
    if (errors.length > 0) {
      sendError(res, 400, "Validation failed", errors);
      return;
    }

    const issueResult = await query<IssueRow>(
      "SELECT * FROM issues WHERE id = $1",
      [Number(id)]
    );

    if (issueResult.rows.length === 0) {
      sendError(res, 404, "Issue not found");
      return;
    }

    const issue = issueResult.rows[0]!;
    const user = req.user!;

    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        sendError(res, 403, "Access denied. You can only update your own issues");
        return;
      }
      if (issue.status !== "open") {
        sendError(res, 409, "Cannot update issue. Issue status is not 'open'");
        return;
      }
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (title !== undefined) {
      params.push(title);
      updates.push(`title = $${params.length}`);
    }

    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }

    if (type !== undefined) {
      params.push(type);
      updates.push(`type = $${params.length}`);
    }
    if (updates.length === 0) {
      sendError(res, 400, "No fields to update");
      return;
    }

    updates.push("updated_at = NOW()");

    params.push(Number(id));
    const sql = `UPDATE issues SET ${updates.join(", ")} WHERE id = $${params.length} RETURNING *`;

    const result = await query<IssueRow>(sql, params);
    const updatedIssue = result.rows[0]!;

    sendSuccess(res, 200, "Issue updated successfully", updatedIssue);
  } catch (error) {
    console.error("Update issue error:", error);
    sendError(res, 500, "Internal server error");
  }
}

export async function deleteIssue(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const issueResult = await query<IssueRow>(
      "SELECT id FROM issues WHERE id = $1",
      [Number(id)]
    );

    if (issueResult.rows.length === 0) {
      sendError(res, 404, "Issue not found");
      return;
    }

    await query("DELETE FROM issues WHERE id = $1", [Number(id)]);

    sendSuccess(res, 200, "Issue deleted successfully");
  } catch (error) {
    console.error("Delete issue error:", error);
    sendError(res, 500, "Internal server error");
  }
}
