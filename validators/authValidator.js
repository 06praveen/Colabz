const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]{3,30}$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .toLowerCase(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidator = [
  body("email")
    .optional()
    .trim(),
  body("username")
    .optional()
    .trim(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};
