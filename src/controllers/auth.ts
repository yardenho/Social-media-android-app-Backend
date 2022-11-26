import User from "../models/user_model";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function sendError(res: Response, msg: string) {
    res.status(400).send({ error: msg });
}

const register = async (req: Request, res: Response) => {
    //check if user is valid
    const email = req.body.email;
    const password = req.body.password;

    if (email == null || password == null) {
        return sendError(res, "please provide valid email and password");
    }

    //check if it is not alreade registred
    try {
        const user = await User.findOne({ email: email });
        if (user != null) {
            return sendError(
                res,
                "user already registered, try a different name"
            );
        }
    } catch (err) {
        console.log("error:" + err);
        return sendError(res, "fail checking user");
    }

    //create the new user
    try {
        const salt = await bcrypt.genSalt(10);
        const encryptedPwd = await bcrypt.hash(password, salt);
        let newUser = new User({
            email: email,
            password: encryptedPwd,
        });
        newUser = await newUser.save();
        res.status(200).send(newUser);
    } catch (err) {
        return sendError(res, "fail registration");
    }
};

const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email == null || password == null) {
        return sendError(res, "please provide valid email and password");
    }
    try {
        const user = await User.findOne({ email: email });
        if (user == null) {
            return sendError(res, "incorrect user or passsword");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return sendError(res, "incorrect user or passsword");
        }

        const accessToken = await jwt.sign(
            { id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
        );

        res.status(200).send({ accessToken: accessToken });
    } catch (err) {
        console.log("error:" + err);
        return sendError(res, "fail checking user");
    }
};

const logout = async (req: Request, res: Response) => {
    res.status(400).send({ error: "not implemented" });
};

const authenticateMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeaders = req.headers["authorization"];
    if (authHeaders == null) return sendError(res, "authentication missing");
    const token = authHeaders.split(" ")[1];
    if (token == null) return sendError(res, "authentication missing");
    try {
        const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        //TODO: fix ts
        // req.userId = user._id;
        console.log("token user: " + user);
        next();
    } catch (err) {
        return sendError(res, "fail validation token");
    }
};

export = {
    login,
    register,
    logout,
    authenticateMiddleware,
};
