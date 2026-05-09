'use strict';

/**
 * Global Express error handler.
 * Returns structured JSON error responses.
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  if (!isClientError) {
    console.error('[Error]', err.stack || err.message);
  }

  res.status(statusCode).json({
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: isClientError ? err.message : 'An internal server error occurred.',
    },
  });
}

module.exports = errorHandler;
