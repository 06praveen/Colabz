/**
 * Standard API Response Helpers for Colabz
 */

/**
 * Send a standardized success JSON response
 * @param {import('express').Response} res - Express response object
 * @param {*} data - Response payload (object or array)
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string|null} message - Optional human-readable message
 * @param {object|null} pagination - Optional pagination metadata
 */
const sendSuccess = (res, data = {}, statusCode = 200, message = null, pagination = null) => {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error JSON response
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Error description
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array|object|null} errors - Detailed validation or field errors
 */
const sendError = (res, message = "Something went wrong", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors && (Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0)) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
