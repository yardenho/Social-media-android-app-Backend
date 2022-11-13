const request = require("supertest");
const app = require("../server"); //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
const mongoose = require("mongoose");
const Post = require("../models/post_model");

//variables for testing
const newPostMessage = "this is the new test post message";
const newPostSender = "999000";
let newPostId = ""; //????????????????????
beforeAll(async () => {
    await Post.remove();
});

afterAll(async () => {
    await Post.remove();
    mongoose.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
});

describe("GET / ", () => {
    test("add new post", async () => {
        const response = await request(app).post("/post").send({
            message: newPostMessage,
            sender: newPostSender,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
        newPostId = response.body._id;
    });

    test("get all posts", async () => {
        const response = await request(app).get("/post");
        expect(response.statusCode).toEqual(200);
        expect(response.body[0].message).toEqual(newPostMessage);
        expect(response.body[0].sender).toEqual(newPostSender);
    });
});
