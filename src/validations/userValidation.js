const { body, param } = require("express-validator");

const createUserValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("companyId")
    .notEmpty()
    .withMessage("Company ID is required")
    .isMongoId()
    .withMessage("Invalid company ID format"),
  body("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")
    .isMongoId()
    .withMessage("Invalid manager ID format"),
];

const updateUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("companyId")
    .optional()
    .isMongoId()
    .withMessage("Invalid company ID format"),
  body("managerId")
    .optional()
    .isMongoId()
    .withMessage("Invalid manager ID format"),
];

const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
};
