/**
 * @swagger
 * tags:
 *   name: User
 *   description: The User API
 */

import express from "express";
import auth from "../controllers/auth";
import user from "../controllers/user";
const router = express.Router();

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: get user by id
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the requested user id
 *     responses:
 *       200:
 *         description: the requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 */
router.get("/:id", auth.authenticateMiddleware, user.getUserById);

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: update existing post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the updated post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: the requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *
 */

router.put("/:id", auth.authenticateMiddleware, user.putUserById);

export = router;
