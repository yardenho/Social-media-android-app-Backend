import request from "supertest";
import app from "../server"; //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
import mongoose from "mongoose";
import Post from "../models/post_model";
import User from "../models/user_model";

//variables for testing
const firstPostMessage = "this is the first new test post message";
const secondPostMessage = "this is the second new test post message";
let firstPostSender = "";

let receivedFirstPostId = "";
let receivedSecondPostId = "";

const newPostMessageUpdated =
    "this is the updated first new test post message !!!";

const userEmail = "user1@gmail.com";
const userPassword = "12345";
const userImage = "url";
const userFullName = "Israel Israeli";
let accessToken = "";

beforeAll(async () => {
    await Post.remove();
    await User.remove();
    const res = await request(app).post("/auth/register").send({
        email: userEmail,
        password: userPassword,
        image: userImage,
        fullName: userFullName,
    });
    firstPostSender = res.body._id;
});

async function loginUser() {
    const response = await request(app).post("/auth/login").send({
        email: userEmail,
        password: userPassword,
    });
    accessToken = response.body.tokens.accessToken;
}

beforeEach(async () => {
    await loginUser();
});

afterAll(async () => {
    await Post.remove();
    await User.remove();
    mongoose.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
});

describe("Posts Tests ", () => {
    test("add new post", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", "JWT " + accessToken)
            .send({
                message: firstPostMessage,
                sender: firstPostSender,
                image: "url",
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(firstPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
        expect(response.body.post.image).toEqual("url");
        console.log("new post =  " + response.body.post);
        receivedFirstPostId = response.body.post._id;
    });

    test("add another new post", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", "JWT " + accessToken)
            .send({
                message: secondPostMessage,
                sender: firstPostSender,
                image: "url",
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(secondPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
        expect(response.body.post.image).toEqual("url");
        receivedSecondPostId = response.body.post._id;
    });

    test("get all posts", async () => {
        const response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post.length).toEqual(2);
    });

    test("get post by Id", async () => {
        const response = await request(app)
            .get("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(firstPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
    });

    test("get post by wrong id fails", async () => {
        const response = await request(app)
            .get("/post/12345")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(400);
    });

    test("get post by sender", async () => {
        const response = await request(app)
            .get("/post?sender=" + firstPostSender)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post.length).toEqual(2);
    });

    test("get post by wrong sender", async () => {
        const response = await request(app)
            .get("/post?sender=12345")
            .set("Authorization", "JWT " + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.length).toEqual(0);
    });

    test("update post by Id", async () => {
        let response = await request(app)
            .put("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken)
            .send({
                message: newPostMessageUpdated,
                sender: firstPostSender,
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);

        response = await request(app)
            .get("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);

        response = await request(app)
            .put("/post/12345")
            .set("Authorization", "JWT " + accessToken)
            .send({
                message: newPostMessageUpdated,
                sender: firstPostSender,
            });
        expect(response.statusCode).toEqual(400);

        response = await request(app)
            .put("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken)
            .send({
                message: newPostMessageUpdated,
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
    });

    test("delete post by Id", async () => {
        const response = await request(app)
            .delete("/post/" + receivedSecondPostId)
            .set("Authorization", "JWT " + accessToken);

        expect(response.statusCode).toEqual(200);
    });

    test("get post that deleted by id ", async () => {
        console.log("in test - " + receivedSecondPostId);
        const response = await request(app)
            .get("/post/" + receivedSecondPostId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post).toEqual(null);
    });
});
