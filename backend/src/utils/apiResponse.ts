import type { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const body: SuccessResponse<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  totalItems: number,
  statusCode = 200,
): Response {
  const totalPages = Math.ceil(totalItems / limit) || 0;
  const data: PaginatedData<T> = {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
  return sendSuccess(res, data, statusCode);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown,
): Response {
  const body: ErrorResponse = {
    success: false,
    error: { code, message, ...(details !== undefined && { details }) },
  };
  return res.status(statusCode).json(body);
}

export type { PaginatedData };
