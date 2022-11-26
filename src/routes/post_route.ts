import express from "express";
const router = express.Router();
import post from "../controllers/post";
import auth from "../controllers/auth.js";

router.get("/", auth.authenticateMiddleware, post.getAllPosts);

router.get("/:id", auth.authenticateMiddleware, post.getPostById);

router.put("/:id", auth.authenticateMiddleware, post.updatePostById);

router.post("/", auth.authenticateMiddleware, post.addNewPost);

export default router;
