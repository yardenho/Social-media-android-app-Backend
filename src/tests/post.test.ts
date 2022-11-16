import request from "supertest";
import app from "../server"; //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
import mongoose from "mongoose";
import Post from "../models/post_model";

//variables for testing
const firstPostMessage = "this is the first new test post message";
const firstPostSender = "999000";

const secondPostMessage = "this is the second new test post message";
const secondPostSender = "888000";

let receivedFirstPostId = "";
let receivedSecondPostId = "";

const newPostMessageUpdated =
    "this is the updated first new test post message !!!";

beforeAll(async () => {
    await Post.remove();
});

afterAll(async () => {
    await Post.remove();
    mongoose.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
});

describe("Posts Tests ", () => {
    test("add new post", async () => {
        const response = await request(app).post("/post").send({
            message: firstPostMessage,
            sender: firstPostSender,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(firstPostMessage);
        expect(response.body.sender).toEqual(firstPostSender);
        receivedFirstPostId = response.body._id;
    });

    test("add new post", async () => {
        const response = await request(app).post("/post").send({
            message: secondPostMessage,
            sender: secondPostSender,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(secondPostMessage);
        expect(response.body.sender).toEqual(secondPostSender);
        receivedSecondPostId = response.body._id;
    });

    test("get all posts", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).toEqual(200);
        expect(response.body[0].message).toEqual(firstPostMessage);
        expect(response.body[0].sender).toEqual(firstPostSender);
    });

    test("get post by Id", async () => {
        const response = await request(app).get("/post/" + receivedFirstPostId);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(firstPostMessage);
        expect(response.body.sender).toEqual(firstPostSender);
    });

    test("get post by wrong id fails", async () => {
        const response = await request(app).get("/post/12345");
        expect(response.statusCode).toEqual(400);
    });

    test("get post by sender", async () => {
        const response = await request(app).get(
            "/post?sender=" + secondPostSender
        );
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body[0].message).toEqual(secondPostMessage);
        expect(response.body[0].sender).toEqual(secondPostSender);
        expect(response.body[0]._id).toEqual(receivedSecondPostId);
    });

    test("get post by wrong sender", async () => {
        const response = await request(app).get("/post?sender=12345");
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(0);
    });

    test("update post by Id", async () => {
        let response = await request(app)
            .put("/post/" + receivedFirstPostId)
            .send({
                message: newPostMessageUpdated,
                sender: firstPostSender,
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessageUpdated);
        expect(response.body.sender).toEqual(firstPostSender);

        response = await request(app).get("/post/" + receivedFirstPostId);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessageUpdated);
        expect(response.body.sender).toEqual(firstPostSender);

        response = await request(app).put("/post/12345").send({
            message: newPostMessageUpdated,
            sender: firstPostSender,
        });
        expect(response.statusCode).toEqual(400);

        response = await request(app)
            .put("/post/" + receivedFirstPostId)
            .send({
                message: newPostMessageUpdated,
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessageUpdated);
        expect(response.body.sender).toEqual(firstPostSender);
    });
});
