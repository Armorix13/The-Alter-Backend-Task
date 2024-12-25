import express from "express";
import userSchema from "../schema/user.schema";
import validate from "../middlewares/validate.middleware";
import userController from "../controllers/user.controller";

const userRoutes = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registers a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google sign-in token
 *                 example: "YOUR_GOOGLE_SIGN_IN_TOKEN"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 token:
 *                   type: string
 *                   description: JWT token for the authenticated user
 *                   example: "YOUR_JWT_TOKEN"
 *       400:
 *         description: Token not provided or user already exists
 *       500:
 *         description: Error during registration
 */
userRoutes.post(
  "/register",
  validate(userSchema.RegisterSchema),
  userController.Register
);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Logs in an existing user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google sign-in token
 *                 example: "YOUR_GOOGLE_SIGN_IN_TOKEN"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *                 token:
 *                   type: string
 *                   description: JWT token for the authenticated user
 *                   example: "YOUR_JWT_TOKEN"
 *       400:
 *         description: Token not provided or user not found
 *       500:
 *         description: Error during login
 */
userRoutes.post("/login", validate(userSchema.LoginSchema), userController.Login);

export default userRoutes;
