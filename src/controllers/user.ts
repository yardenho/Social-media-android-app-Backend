import User from "../models/user_model";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

const getUserById = async (req: Request, res: Response) => {
    console.log("in getUserById");
    console.log(req.params);
    try {
        const users = await User.findById(req.params.id);
        res.status(200).send(users);
    } catch (err) {
        res.status(400).send({ error: "fail to get user from db" });
    }
};

const putUserById = async (req: Request, res: Response) => {
    console.log("in putUserById");
    console.log(req.params.id);
    console.log(req.body.password);
    if (req.body.password != undefined) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        console.log("save post in db");
        res.status(200).send(user);
    } catch (err) {
        console.log("fail to update post in db");
        res.status(400).send({ error: "fail to update post in db" });
    }
};

export = { getUserById, putUserById };
