const express = require("express");
const router = express.Router();
const post = require("../controllers/post.js");

router.get("/", post.getAllPosts);

router.get("/:id", post.getPostById);

router.get("/:sender", post.getPostBySender);

router.put("/:id", post.updatePostById);

router.post("/", post.addNewPost);

module.exports = router;
