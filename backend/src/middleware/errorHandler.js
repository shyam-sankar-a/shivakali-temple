import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack });
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}
