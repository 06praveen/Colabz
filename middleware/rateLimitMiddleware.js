const { sendError } = require("../utils/apiResponse");

/**
 * Creates an in-memory sliding window rate limiter middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g. 60000 = 1 min)
 * @param {number} options.max - Maximum number of requests allowed in window
 * @param {string} options.message - Error message when rate limit exceeded
 */
const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const max = options.max || 60; // 60 requests default
  const message = options.message || "Too many requests. Please try again later.";

  const hits = new Map();

  // Periodic cleanup of stale records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.startTime > windowMs * 2) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // Identify client by user ID if authenticated, else by client IP
    const key = (req.user && (req.user._id || req.user.id))
      ? `user_${req.user._id || req.user.id}`
      : req.ip || req.headers["x-forwarded-for"] || "anonymous";

    const now = Date.now();
    const record = hits.get(key);

    if (!record) {
      hits.set(key, { count: 1, startTime: now });
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    if (now - record.startTime < windowMs) {
      if (record.count >= max) {
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", 0);
        res.setHeader("Retry-After", Math.ceil((windowMs - (now - record.startTime)) / 1000));
        return sendError(res, message, 429);
      }
      record.count += 1;
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - record.count);
      return next();
    }

    // Window elapsed, reset counter
    record.count = 1;
    record.startTime = now;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - 1);
    return next();
  };
};

module.exports = rateLimit;
