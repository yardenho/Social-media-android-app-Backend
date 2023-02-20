/**
 * @swagger
 * tags:
 *   name: User
 *   description: The User API
 */

import express from "express";
import auth from "../controllers/auth";
import user from "../controllers/user";
import request from "../request.js";
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

// router.get("/:id", auth.authenticateMiddleware, async (req, res) => {
//     try {
//         const response = await user.getUserById(request.fromRestRequest(req));
//         response.sendRestResponse(res);
//     } catch (err) {
//         res.status(400).send({
//             status: "fail",
//             message: err.message,
//         });
//     }
// });

export = router;
