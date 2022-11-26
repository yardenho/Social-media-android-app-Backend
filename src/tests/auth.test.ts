import request from "supertest";
import app from "../server"; //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
import mongoose from "mongoose";
import Post from "../models/post_model";
import User from "../models/user_model";

//variables for testing
// const firstPostMessage = "this is the first new test post message";
// const firstPostSender = "999000";
// const newPostMessageUpdated =
//     "this is the updated first new test post message !!!";

// let receivedFirstPostId = "";

const userEmail = "user1@gmail.com";
const userPassword = "12345";
let accessToken = "";
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
    test("register test", async () => {
        const response = await request(app).post("/auth/register").send({
            email: userEmail,
            password: userPassword,
        });
        expect(response.statusCode).toEqual(200);
    });

    test("login test", async () => {
        let response = await request(app).post("/auth/login").send({
            email: userEmail,
            password: userPassword,
        });
        expect(response.statusCode).toEqual(200);
        accessToken = response.body.accessToken;
        expect(accessToken).not.toBeNull();

        response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);

        response = await request(app)
            .get("/post")
            .set("Authorization", "JWT 1" + accessToken);
        expect(response.statusCode).not.toEqual(200);
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

    test("logout test", async () => {
        const response = await request(app).post("/auth/logout").send({
            email: userEmail,
            password: userPassword,
        });
        expect(response.statusCode).toEqual(200);
    });
});
