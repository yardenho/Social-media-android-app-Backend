"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../controllers/auth"));
/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 */
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *       User:
 *           type: object
 *           required:
 *               - email
 *               - password
 *               - image
 *               - full name
 *           properties:
 *               email:
 *                   type: string
 *                   description: The user email
 *               password:
 *                   type: string
 *                   description: The user password
 *               image:
 *                   type: string
 *                   description: The user image
 *               full name:
 *                   type: string
 *                   description: The user full name
 *           example:
 *               email: 'bob@gmail.com'
 *               password: '123456'
 *               image: 'url'
 *               full name: 'bob brown'
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *       summary: register a new user
 *       tags: [Auth]
 *       requestBody:
 *           required: true
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/User'
 *       responses:
 *          200:
 *               description: Register success returns user info
 *               content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/schemas/User'
 *          400:
 *              description: Registeration error
 *              content:
 *                  application/json:
 *                      schema:
 *                          err:
 *                              type: string
 *                              description: The error description
 *
 */
router.post("/register", auth_1.default.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login success retruns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               access_token:
 *                 type: string
 *                 description: The Access Token
 *               refresh_token:
 *                 type: string
 *                 description: The Refresh Token
 *             example:
 *               access_token: '223412341...'
 *               refresh_token: '123456...'
 *       400:
 *              description: login error
 *              content:
 *                  application/json:
 *                      schema:
 *                          err:
 *                              type: string
 *                              description: The error description
 */
router.post("/login", auth_1.default.login);
/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: refresh access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: refresh token success returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               access_token:
 *                 type: string
 *                 description: The Access Token
 *               refresh_token:
 *                 type: string
 *                 description: The Refresh Token
 *             example:
 *               access_token: '223412341...'
 *               refresh_token: '123456...'
 *       400:
 *              description: Refresh token error
 *              content:
 *                  application/json:
 *                      schema:
 *                          err:
 *                              type: string
 *                              description: The error description
 *
 */
router.get("/refresh", auth_1.default.refresh);
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: logout user invalidate refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: logout sucess, refresh token is invalidated
 *       400:
 *              description: Logout error
 *              content:
 *                  application/json:
 *                      schema:
 *                          err:
 *                              type: string
 *                              description: The error description
 *
 */
router.get("/logout", auth_1.default.logout);
exports.default = router;
//# sourceMappingURL=auth_route.js.map