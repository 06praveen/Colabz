const mongoose = require("mongoose");
const { sendError } = require("../utils/apiResponse");

/**
 * Validates that specified URL params contain valid MongoDB ObjectIds.
 * @param  {...string} paramNames - e.g. "id", "projectId", "taskId"
 */
const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      const val = req.params[param];
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        return sendError(
          res,
          `Invalid ID format for parameter '${param}': '${val}' is not a valid ObjectId`,
          400
        );
      }
    }
    next();
  };
};

module.exports = validateObjectId;
