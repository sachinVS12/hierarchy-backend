const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register/user:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *               - managerId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               companyId:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register/user", authController.registerUser);

/**
 * @swagger
 * /api/auth/register/manager:
 *   post:
 *     summary: Register a new manager
 *     tags: [Auth]
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
 *         description: Manager registered successfully
 */
router.post("/register/manager", authController.registerManager);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user or manager
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [user, manager]
 *                 default: user
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", authController.login);

module.exports = router;
