const { body, param } = require("express-validator");

const createTagValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
  body("topic")
    .notEmpty()
    .withMessage("Topic is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Topic must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Topic can only contain letters, numbers, spaces, and hyphens",
    ),
];

const updateTagValidation = [
  param("id").isMongoId().withMessage("Invalid tag ID format"),
  body("topic")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Topic must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Topic can only contain letters, numbers, spaces, and hyphens",
    ),
];

const tagIdValidation = [
  param("id").isMongoId().withMessage("Invalid tag ID format"),
];

module.exports = {
  createTagValidation,
  updateTagValidation,
  tagIdValidation,
};
