const express = require("express");
const managerController = require("../controllers/managerController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

// All manager routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/managers:
 *   post:
 *     summary: Create a new manager
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - companyId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               companyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created successfully
 */
router.post(
  "/",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN"),
  managerController.createManager,
);

/**
 * @swagger
 * /api/managers:
 *   get:
 *     summary: Get all managers
 *     tags: [Managers]
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
 *     responses:
 *       200:
 *         description: List of managers
 */
router.get(
  "/",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"),
  managerController.getManagers,
);

/**
 * @swagger
 * /api/managers/{id}:
 *   get:
 *     summary: Get manager by ID
 *     tags: [Managers]
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
 *         description: Manager details
 */
router.get(
  "/:id",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"),
  managerController.getManagerById,
);

/**
 * @swagger
 * /api/managers/{id}:
 *   put:
 *     summary: Update manager
 *     tags: [Managers]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager updated successfully
 */
router.put(
  "/:id",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"),
  managerController.updateManager,
);

/**
 * @swagger
 * /api/managers/{id}:
 *   delete:
 *     summary: Delete manager
 *     tags: [Managers]
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
 *         description: Manager deleted successfully
 */
router.delete(
  "/:id",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN"),
  managerController.deleteManager,
);

module.exports = router;
