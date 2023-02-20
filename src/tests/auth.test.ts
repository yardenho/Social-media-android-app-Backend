import request from "supertest";
import app from "../server"; //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
import mongoose from "mongoose";
import Post from "../models/post_model";
import User from "../models/user_model";

const userEmail = "user1@gmail.com";
const userPassword = "12345";
const userImage = "url";
const userFullName = "Israel Israeli";

let accessToken = "";
let refreshToken = "";

beforeAll(async () => {
    await Post.remove();
    await User.remove();
});

afterAll(async () => {
    await Post.remove();
    await User.remove();
    mongoose.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
});

describe("Auth Tests ", () => {
    test("Not authorized attemp test", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).not.toEqual(200);
    });

    test("register test", async () => {
        const response = await request(app).post("/auth/register").send({
            email: userEmail,
            password: userPassword,
            image: userImage,
            fullName: userFullName,
        });
        expect(response.statusCode).toEqual(200);
    });

    test("register test with the same email", async () => {
        const response = await request(app).post("/auth/register").send({
            email: userEmail,
            password: userPassword,
            image: userImage,
            fullName: userFullName,
        });
        expect(response.statusCode).toEqual(400);
    });

    test("login test wrong password", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: userEmail,
                password: userPassword + "4",
            });
        expect(response.statusCode).not.toEqual(200);
        const access = response.body.accessToken;
        expect(access).toBeUndefined();
    });

    test("login test", async () => {
        const response = await request(app).post("/auth/login").send({
            email: userEmail,
            password: userPassword,
        });
        expect(response.statusCode).toEqual(200);
        accessToken = response.body.tokens.accessToken;
        expect(accessToken).not.toBeNull();
        refreshToken = response.body.tokens.refreshToken;
        expect(refreshToken).not.toBeNull();
    });

    test("login using valid access token ", async () => {
        const response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
    });

    test("login using wrond access token ", async () => {
        const response = await request(app)
            .get("/post")
            .set("Authorization", "JWT 1" + accessToken);
        expect(response.statusCode).not.toEqual(200);
    });

    jest.setTimeout(15000);
    test("test expeired token", async () => {
        await new Promise((r) => setTimeout(r, 6000));
        const response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).not.toEqual(200);
    });

    test("test refresh token", async () => {
        let response = await request(app)
            .get("/auth/refresh")
            .set("Authorization", "JWT " + refreshToken);
        expect(response.statusCode).toEqual(200);
        accessToken = response.body.accessToken;
        expect(accessToken).not.toBeNull();
        refreshToken = response.body.refreshToken;
        expect(refreshToken).not.toBeNull();

        response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
    });

    test("logout test", async () => {
        const response = await request(app)
            .get("/auth/logout")
            .set("Authorization", "JWT " + refreshToken);
        expect(response.statusCode).toEqual(200);
    });
});
