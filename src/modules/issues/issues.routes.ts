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

issuesRouter.post("/", authenticate, createIssue);

issuesRouter.get("/", getAllIssues);

issuesRouter.get("/:id", getIssueById);

issuesRouter.patch("/:id", authenticate, updateIssue);

issuesRouter.delete("/:id", authenticate, authorize("maintainer"), deleteIssue);

export default issuesRouter;
