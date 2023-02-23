import request from "supertest";
import app from "../server"; //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
import mongoose from "mongoose";
import Post from "../models/post_model";
import User from "../models/user_model";

let newUserId = "";
const userEmail = "user1@gmail.com";
const userPassword = "12345";
const userImage = "url";
const userFullName = "Israel Israeli";
const newUserFullName = "Israel Israeli";

let accessToken = "";

beforeAll(async () => {
    await User.remove(); //{ 'id: ': newStudenId })
    console.log("beforeAll");
    const res = await request(app).post("/auth/register").send({
        email: userEmail,
        password: userPassword,
        image: userImage,
        fullName: userFullName,
    });
    newUserId = res.body._id;
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
    console.log("afterAll");
    await Post.remove();
    await User.remove();
    mongoose.connection.close();
});

describe("User Tests", () => {
    test("get user by id", async () => {
        const response = await request(app)
            .get("/user/" + newUserId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body._id).toEqual(newUserId);
        expect(response.body.fullName).toEqual(userFullName);
    });

    test("update user by Id", async () => {
        let response = await request(app)
            .put("/user/" + newUserId)
            .set("Authorization", "JWT " + accessToken)
            .send({
                userFullName: newUserFullName,
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.fullName).toEqual(newUserFullName);
        expect(response.body._id).toEqual(newUserId);

        response = await request(app)
            .get("/user/" + newUserId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.fullName).toEqual(newUserFullName);
        expect(response.body._id).toEqual(newUserId);

        response = await request(app)
            .put("/user/12345")
            .set("Authorization", "JWT " + accessToken)
            .send({
                userFullName: newUserFullName,
            });
        expect(response.statusCode).toEqual(400);
    });
});
