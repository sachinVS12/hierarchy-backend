const { body } = require("express-validator");

const registerUserValidation = [
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

const registerManagerValidation = [
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

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("userType")
    .optional()
    .isIn(["user", "manager"])
    .withMessage("User type must be either user or manager"),
];

module.exports = {
  registerUserValidation,
  registerManagerValidation,
  loginValidation,
};
