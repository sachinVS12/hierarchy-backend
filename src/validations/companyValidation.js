const { body, param } = require("express-validator");

const createCompanyValidation = [
  body("name")
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Company name can only contain letters, numbers, spaces, and hyphens",
    ),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("status").optional().isBoolean().withMessage("Status must be a boolean"),
];

const updateCompanyValidation = [
  param("id").isMongoId().withMessage("Invalid company ID format"),
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Company name can only contain letters, numbers, spaces, and hyphens",
    ),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("status").optional().isBoolean().withMessage("Status must be a boolean"),
];

const companyIdValidation = [
  param("id").isMongoId().withMessage("Invalid company ID format"),
];

module.exports = {
  createCompanyValidation,
  updateCompanyValidation,
  companyIdValidation,
};
