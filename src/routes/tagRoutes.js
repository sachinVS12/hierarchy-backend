const express = require("express");
const tagController = require("../controllers/tagController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

// All tag routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - topic
 *             properties:
 *               userId:
 *                 type: string
 *               topic:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 */
router.post(
  "/",
  restrictTo("MANAGER", "COMPANY_ADMIN", "SUPER_ADMIN"),
  tagController.createTag,
);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: managerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get(
  "/",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "USER"),
  tagController.getTags,
);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag details
 */
router.get(
  "/:id",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "USER"),
  tagController.getTagById,
);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated successfully
 */
router.put(
  "/:id",
  restrictTo("MANAGER", "COMPANY_ADMIN", "SUPER_ADMIN"),
  tagController.updateTag,
);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tag deleted successfully
 */
router.delete(
  "/:id",
  restrictTo("MANAGER", "COMPANY_ADMIN", "SUPER_ADMIN"),
  tagController.deleteTag,
);

module.exports = router;
