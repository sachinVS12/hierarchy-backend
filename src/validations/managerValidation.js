const { body, param } = require("express-validator");

const createManagerValidation = [
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
];

const updateManagerValidation = [
  param("id").isMongoId().withMessage("Invalid manager ID format"),
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
];

const managerIdValidation = [
  param("id").isMongoId().withMessage("Invalid manager ID format"),
];

module.exports = {
  createManagerValidation,
  updateManagerValidation,
  managerIdValidation,
};
