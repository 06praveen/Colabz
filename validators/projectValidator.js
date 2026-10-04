const { body } = require("express-validator");

const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("visibility")
    .optional()
    .isIn(["public", "private", "PUBLIC", "PRIVATE"])
    .withMessage("Visibility must be either public or private"),
  body("language")
    .optional()
    .isString()
    .withMessage("Language must be a string"),
  body("technologies")
    .optional()
    .custom((val) => {
      if (Array.isArray(val) || typeof val === "string") return true;
      throw new Error("Technologies must be an array of strings or comma-separated string");
    }),
];

const updateProjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("visibility")
    .optional()
    .isIn(["public", "private", "PUBLIC", "PRIVATE"])
    .withMessage("Visibility must be either public or private"),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
};
