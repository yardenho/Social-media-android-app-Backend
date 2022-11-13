import express from "express";
const router = express.Router();
import post from "../src/controllers/post.js";

router.get("/", post.getAllPosts);

router.get("/:id", post.getPostById);

router.put("/:id", post.updatePostById);

router.post("/", post.addNewPost);

export default router;
