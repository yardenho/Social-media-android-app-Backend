import User from "../models/user_model";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function sendError(statusCode: number, res: Response, msg: string) {
    res.status(statusCode).send({ error: msg });
}

const register = async (req: Request, res: Response) => {
    //check if user is valid
    const email = req.body.email;
    const password = req.body.password;
    const userImage = req.body.image;
    const userFullName = req.body.fullName;

    if (
        email == null ||
        password == null ||
        userImage == null ||
        userFullName == null
    ) {
        return sendError(400, res, "please provide valid details");
    }

    //check if it is not alreade registred
    try {
        const user = await User.findOne({ email: email });
        if (user != null) {
            return sendError(
                400,
                res,
                "user already registered, try a different name"
            );
        }

        //create the new user
        const salt = await bcrypt.genSalt(10);
        const encryptedPwd = await bcrypt.hash(password, salt);
        const newUser = new User({
            email: email,
            password: encryptedPwd,
            image: userImage,
            fullName: userFullName,
        });
        await newUser.save();
        return res.status(200).send({
            email: email,
            _id: newUser._id,
        });
    } catch (err) {
        return sendError(400, res, "fail registration");
    }
};

async function generateTokens(userId: string) {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
}

const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email == null || password == null) {
        return sendError(400, res, "please provide valid email and password");
    }
    try {
        const user = await User.findOne({ email: email });
        if (user == null) {
            return sendError(400, res, "incorrect user or passsword");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return sendError(400, res, "incorrect user or passsword");
        }

        const tokens = await generateTokens(user._id.toString());

        if (user.refresh_tokens == null)
            user.refresh_tokens = [tokens.refreshToken];
        else user.refresh_tokens.push(tokens.refreshToken);
        await user.save();

        return res.status(200).send({ tokens: tokens, userId: user._id });
    } catch (err) {
        console.log("error:" + err);
        return sendError(400, res, "fail checking user");
    }
};

function getTokenFromRequest(req: Request): string {
    const authHeaders = req.headers["authorization"];
    if (authHeaders == null) return null;
    return authHeaders.split(" ")[1];
}

type TokenInfo = {
    id: string;
};

const refresh = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null)
        return sendError(400, res, "authentication missing");

    try {
        const user: TokenInfo = <TokenInfo>(
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        );
        const userObj = await User.findById(user.id);
        if (userObj == null)
            return sendError(400, res, "fail validation token");
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [];
            await userObj.save();
            return sendError(400, res, "authentication missing");
        }

        const tokens = await generateTokens(userObj._id.toString());

        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)] =
            tokens.refreshToken;
        console.log("refresh token: " + refreshToken);
        console.log("with token: " + tokens.refreshToken);
        await userObj.save();

        return res.status(200).send(tokens);
    } catch (err) {
        return sendError(400, res, "fail validation token");
    }
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null)
        return sendError(400, res, "authentication missing");

    try {
        const user = <TokenInfo>(
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        );
        const userObj = await User.findById(user.id);
        if (userObj == null)
            return sendError(400, res, "fail validation token");
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [];
            await userObj.save();
            return sendError(400, res, "authentication missing");
        }

        userObj.refresh_tokens.splice(
            userObj.refresh_tokens.indexOf(refreshToken),
            1
        );
        await userObj.save();
        return res.status(200).send();
    } catch (err) {
        return sendError(400, res, "fail validation token");
    }
};

const authenticateMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("in middleware");
    const token = getTokenFromRequest(req);
    if (token == null) {
        console.log("in middleware token == null");
        return sendError(400, res, "authentication missing");
    }
    try {
        const user = <TokenInfo>(
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        );
        req.body.userId = user.id;
        console.log("token user: " + user);
        return next();
    } catch (err) {
        console.log("in middleware error");
        return sendError(401, res, "fail validation token");
    }
};

export = {
    login,
    register,
    refresh,
    logout,
    authenticateMiddleware,
};
