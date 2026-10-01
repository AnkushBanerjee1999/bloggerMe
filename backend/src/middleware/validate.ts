import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Schema } from 'joi';
import { ValidationError } from '../utils/AppError.js';

interface ValidationSchemas {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const key of ['body', 'query', 'params'] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const { error, value } = schema.validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const details = error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        }));
        const message = details.map((d) => d.message).join(', ');
        next(new ValidationError(message, details));
        return;
      }

      req[key] = value;
    }
    next();
  };
}
