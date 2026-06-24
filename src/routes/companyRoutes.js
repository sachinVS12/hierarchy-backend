const express = require("express");
const companyController = require("../controllers/companyController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

// All company routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Company created successfully
 */
router.post("/", restrictTo("SUPER_ADMIN"), companyController.createCompany);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
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
 *     responses:
 *       200:
 *         description: List of companies
 */
router.get(
  "/",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN"),
  companyController.getCompanies,
);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
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
 *         description: Company details
 */
router.get(
  "/:id",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN"),
  companyController.getCompanyById,
);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update company
 *     tags: [Companies]
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
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 */
router.put(
  "/:id",
  restrictTo("SUPER_ADMIN", "COMPANY_ADMIN"),
  companyController.updateCompany,
);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete company
 *     tags: [Companies]
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
 *         description: Company deleted successfully
 */
router.delete(
  "/:id",
  restrictTo("SUPER_ADMIN"),
  companyController.deleteCompany,
);

module.exports = router;
