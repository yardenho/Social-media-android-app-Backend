const request = require("supertest");
const app = require("../server"); //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
const mongoose = require("mongoose");
const Post = require("../models/post_model");

//variables for testing
const firstPostMessage = "this is the first new test post message";
const firstPostSender = "999000";

const secondPostMessage = "this is the second new test post message";
const secondPostSender = "888000";

let receivedFirstPostId = "";
let receivedSecondPostId = "";

beforeAll(async () => {
    await Post.remove();
});

afterAll(async () => {
    //await Post.remove();
    mongoose.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
});

describe("GET / ", () => {
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

    test("get post by sender", async () => {
        const response = await request(app).get(
            "/post?sender=" + secondPostSender
        );
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body[0].message).toEqual(secondPostMessage);
        expect(response.body[0]._id).toEqual(receivedSecondPostId);
    });

    test("update post by Id", async () => {
        const response = await request(app)
            .put("/post/" + receivedFirstPostId)
            .send({
                message: "this is the updated first new test post message !!!",
                sender: firstPostSender,
            });
        expect(response.statusCode).toEqual(200);
    });
});
