import type { Response } from "express";

export function sendSuccess(
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
): void {
  const response: { success: boolean; message: string; data?: unknown } = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void {
  const response: { success: boolean; message: string; errors?: unknown } = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}
