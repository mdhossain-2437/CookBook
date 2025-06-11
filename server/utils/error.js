/**
 * Custom error creation utility
 * 
 * This module provides functions for creating standardized error objects
 * to be used throughout the application.
 */

// Create a custom error with status code and message
exports.createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Create a validation error
exports.createValidationError = (message) => {
  return exports.createError(400, message || 'Validation error');
};

// Create an authentication error
exports.createAuthError = (message) => {
  return exports.createError(401, message || 'Authentication error');
};

// Create a forbidden error
exports.createForbiddenError = (message) => {
  return exports.createError(403, message || 'Forbidden');
};

// Create a not found error
exports.createNotFoundError = (message) => {
  return exports.createError(404, message || 'Resource not found');
};

// Create a server error
exports.createServerError = (message) => {
  return exports.createError(500, message || 'Internal server error');
};