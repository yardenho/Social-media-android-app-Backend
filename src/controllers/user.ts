import User from "../models/user_model";
import { Request, Response } from "express";
import request from "../request";
import response from "../response";
import error from "../error";

const getUserById = async (req: Request, res: Response) => {
    console.log("in getUserById");
    console.log(req.params);
    try {
        const users = await User.findById(req.params.id);
        console.log("user " + users);
        res.status(200).send(users);
    } catch (err) {
        res.status(400).send({ error: "fail to get user from db" });
    }
};

// const getUserById = async (req: request) => {
//     console.log(req.params.id);

//     try {
//         const posts = await User.findById(req.params.id);
//         return new response(posts, req.userId, null);
//     } catch (err) {
//         console.log("fail to get post from db");
//         return new response(null, req.userId, new error(400, err.message));
//     }
// };

export = { getUserById };
