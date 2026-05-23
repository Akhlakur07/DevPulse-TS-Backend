import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "./issues.controller.js";

const issuesRouter = Router();

// POST /api/issues — Create a new issue (authenticated users only)
issuesRouter.post("/", authenticate, createIssue);

// GET /api/issues — Get all issues with optional filters (public)
issuesRouter.get("/", getAllIssues);

// GET /api/issues/:id — Get a single issue by ID (public)
issuesRouter.get("/:id", getIssueById);

// PATCH /api/issues/:id — Update an issue (authenticated, permission-checked in controller)
issuesRouter.patch("/:id", authenticate, updateIssue);

// DELETE /api/issues/:id — Delete an issue (maintainer only)
issuesRouter.delete("/:id", authenticate, authorize("maintainer"), deleteIssue);

export default issuesRouter;
