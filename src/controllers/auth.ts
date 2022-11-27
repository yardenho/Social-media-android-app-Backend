import User from "../models/user_model";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { StringSchemaDefinition } from "mongoose";

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

// type Tokens = {
//     accessToken: string;
//     refreshToken: string;
// };

// async function generateTokens(userId: any): Promise<string> {
//     const newAccessToken = await jwt.sign(
//         { id: userId },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
//     );

//     const newRefreshToken = await jwt.sign(
//         { id: userId },
//         process.env.REFRESH_TOKEN_SECRET
//     );
//     return new Promise((resolve) => {
//         return userId;
//     });

//     // return new Promise<Token> { accessToken: newAccessToken, refreshToken: newRefreshToken };
// }

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

        const refreshToken = await jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET
        );
        // const rc = await generateTokens(user._id);
        if (user.refresh_tokens == null) user.refresh_tokens = [refreshToken];
        else user.refresh_tokens.push(refreshToken);
        await user.save();

        res.status(200).send({
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (err) {
        console.log("error:" + err);
        return sendError(res, "fail checking user");
    }
};

function getTokenFromRequest(req: Request): string {
    const authHeaders = req.headers["authorization"];
    if (authHeaders == null) return null;
    return authHeaders.split(" ")[1];
}

const refresh = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null) return sendError(res, "authentication missing");

    try {
        const user = (await jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )) as JwtPayload;
        const userObj = await User.findById(user.id);
        if (userObj == null) return sendError(res, "fail validation token");
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [];
            await userObj.save();
            return sendError(res, "authentication missing");
        }

        const newAccessToken = await jwt.sign(
            { id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
        );

        const newRefreshToken = await jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET
        );
        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)];
        await userObj.save();

        return res.status(200).send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return sendError(res, "fail validation token");
    }
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null) return sendError(res, "authentication missing");

    try {
        const user = (await jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )) as JwtPayload;
        const userObj = await User.findById(user.id);
        if (userObj == null) return sendError(res, "fail validation token");
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [];
            await userObj.save();
            return sendError(res, "authentication missing");
        }

        userObj.refresh_tokens.splice(
            userObj.refresh_tokens.indexOf(refreshToken),
            1
        );
        await userObj.save();
        res.status(200).send();
    } catch (err) {
        return sendError(res, "fail validation token");
    }
};

const authenticateMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = getTokenFromRequest(req);
    if (token == null) return sendError(res, "authentication missing");

    try {
        const user = (await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )) as JwtPayload;
        req.body.userId = user.id;
        console.log("token user: " + user);
        next();
    } catch (err) {
        return sendError(res, "fail validation token");
    }
};

export = {
    login,
    register,
    refresh,
    logout,
    authenticateMiddleware,
};
