/**
 * Centralized Error Handling Middleware for Colabz API
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle JSON parse error (e.g. malformed body)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
  }

  const responsePayload = {
    success: false,
    message,
  };

  if (errors && (Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0)) {
    responsePayload.errors = errors;
  }

  if (process.env.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
