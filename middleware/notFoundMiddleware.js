/**
 * Middleware to handle unmatched routes (404 Not Found)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = notFound;
