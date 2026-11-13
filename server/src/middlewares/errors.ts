import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'The submitted data is invalid' } });
    return;
  }
  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: { code: 'INVALID_IDENTIFIER', message: 'The supplied identifier is invalid' } });
    return;
  }
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } });
    return;
  }
  console.error('Unhandled request error', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
};
