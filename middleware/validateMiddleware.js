const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

/**
 * Middleware that runs express-validator validations and formats errors
 * @param {Array} validations - Array of express-validator validation chains
 */
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return sendError(res, "Validation failed", 400, formattedErrors);
  };
};

module.exports = validate;
