"use strict";
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
const post_model_1 = __importDefault(require("../models/post_model"));
const response_1 = __importDefault(require("../response"));
const error_1 = __importDefault(require("../error"));
const newGetAllPosts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    // implement the get all posts with specific sender
    try {
        let posts = {};
        if (req.query != null && req.query.sender != null) {
            posts = yield post_model_1.default.find({ sender: req.query.sender });
        }
        else {
            posts = yield post_model_1.default.find();
        }
        return new response_1.default(posts, req.userId, null);
    }
    catch (err) {
        console.log("err");
        return new response_1.default(null, req.userId, new error_1.default(400, err.message));
    }
});
const getAllPostsEvent = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("");
    try {
        const posts = yield post_model_1.default.find();
        return { status: "OK", data: posts };
    }
    catch (err) {
        console.log("err");
        return { status: "FAIL", data: "" };
    }
});
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let posts = {};
        if (req.query.sender == null) {
            posts = yield post_model_1.default.find();
        }
        else {
            posts = yield post_model_1.default.find({ sender: req.query.sender });
        }
        res.status(200).send(posts);
    }
    catch (err) {
        res.status(400).send({ error: "fail to get posts from db" });
    }
});
const addNewPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    //save in DB
    const post = new post_model_1.default({
        message: req.body.message,
        sender: req.body.userId, //extract the user id from the auth ,
    });
    try {
        const newPost = yield post.save();
        console.log("save post in db");
        res.status(200).send(newPost);
    }
    catch (err) {
        console.log("fail to save post in db");
        res.status(400).send({ error: "fail adding new post to db" });
    }
});
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.id);
    try {
        const posts = yield post_model_1.default.findById(req.params.id);
        res.status(200).send(posts);
    }
    catch (err) {
        res.status(400).send({ error: "fail to get post from db" });
    }
});
const putPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        console.log("save post in db");
        res.status(200).send(post);
    }
    catch (err) {
        console.log("fail to update post in db");
        res.status(400).send({ error: "fail adding new post to db" });
    }
});
module.exports = {
    newGetAllPosts,
    getAllPostsEvent,
    getAllPosts,
    addNewPost,
    getPostById,
    putPostById,
};
//# sourceMappingURL=post.js.map