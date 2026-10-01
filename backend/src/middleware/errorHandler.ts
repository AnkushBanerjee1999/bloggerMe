import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';
import { config } from '../config/index.js';

function getMongooseErrorMessage(err: unknown): { code: string; message: string; statusCode: number } | null {
  if (err && typeof err === 'object' && 'name' in err) {
    const name = (err as { name: string }).name;

    if (name === 'ValidationError') {
      const errors = (err as { errors?: Record<string, { message: string }> }).errors;
      const messages = errors
        ? Object.values(errors).map((e) => e.message).join(', ')
        : 'Validation failed';
      return { code: 'VALIDATION_ERROR', message: messages, statusCode: 422 };
    }

    if (name === 'CastError') {
      return { code: 'INVALID_ID', message: 'Invalid ID format', statusCode: 400 };
    }

    if (name === 'MongoServerError') {
      const code = (err as { code?: number }).code;
      if (code === 11000) {
        const keyValue = (err as { keyValue?: Record<string, string> }).keyValue;
        const field = keyValue ? Object.keys(keyValue)[0] : 'field';
        return {
          code: 'DUPLICATE_KEY',
          message: `A record with this ${field} already exists`,
          statusCode: 409,
        };
      }
    }
  }
  return null;
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', 'The requested resource was not found', 404);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  const mongooseError = getMongooseErrorMessage(err);
  if (mongooseError) {
    sendError(res, mongooseError.code, mongooseError.message, mongooseError.statusCode);
    return;
  }

  if (err instanceof Error) {
    if (config.isProduction) {
      sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
    } else {
      sendError(res, 'INTERNAL_ERROR', err.message, 500);
    }
    return;
  }

  sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
