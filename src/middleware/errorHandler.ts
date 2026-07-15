import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : 'Unexpected error';

  res.status(500).json({
    error: 'Internal Server Error',
    message
  });
};
