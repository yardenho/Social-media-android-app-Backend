"use strict";
/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/**
 * @swagger
 * tags:
 *   name: Post
 *   description: The Posts API
 */
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const post_1 = __importDefault(require("../controllers/post"));
const auth_js_1 = __importDefault(require("../controllers/auth.js"));
const request_1 = __importDefault(require("../request"));
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - message
 *         - sender
 *         - image
 *       properties:
 *         message:
 *           type: string
 *           description: The post text
 *         sender:
 *           type: string
 *           description: The poster id
 *         image:
 *           type: string
 *           description: The post image
 *       example:
 *         message: 'this is my new post'
 *         sender: '12342345234556'
 *         image: 'url'
 */
/**
 * @swagger
 * /post:
 *   get:
 *     summary: get list of post from server
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *           description: filter the posts according to the given sender id
 *     responses:
 *       200:
 *         description: the list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Post'
 *
 *
 */
router.get("/", auth_js_1.default.authenticateMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield post_1.default.getAllPosts(request_1.default.fromRestRequest(req));
        response.sendRestResponse(res);
    }
    catch (err) {
        res.status(400).send({
            status: "fail",
            message: err.message,
        });
    }
}));
/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: get post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the requested post id
 *     responses:
 *       200:
 *         description: the requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *
 *
 *
 */
router.get("/:id", auth_js_1.default.authenticateMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield post_1.default.getPostById(request_1.default.fromRestRequest(req));
        response.sendRestResponse(res);
    }
    catch (err) {
        res.status(400).send({
            status: "fail",
            message: err.message,
        });
    }
}));
/**
 * @swagger
 * /post:
 *   post:
 *     summary: add a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
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
 *
 *
 */
router.post("/", auth_js_1.default.authenticateMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield post_1.default.addNewPost(request_1.default.fromRestRequest(req));
        response.sendRestResponse(res);
    }
    catch (err) {
        res.status(400).send({
            status: "fail",
            message: err.message,
        });
    }
}));
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
 *           description: the updated post by id
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
 *
 */
router.put("/:id", auth_js_1.default.authenticateMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield post_1.default.putPostById(request_1.default.fromRestRequest(req));
        response.sendRestResponse(res);
    }
    catch (err) {
        res.status(400).send({
            status: "fail",
            message: err.message,
        });
    }
}));
/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: delete post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the requested post id
 *     responses:
 *       200:
 *         description: the requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *
 *
 */
router.delete("/:id", auth_js_1.default.authenticateMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield post_1.default.deletePostById(request_1.default.fromRestRequest(req));
        response.sendRestResponse(res);
    }
    catch (err) {
        res.status(400).send({
            status: "fail",
            message: err.message,
        });
    }
}));
module.exports = router;
//# sourceMappingURL=post_route.js.map