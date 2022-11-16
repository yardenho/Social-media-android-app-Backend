"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server")); //צריך לשלוח את זה על ההמשק שלנו, צריך לשלוח את הבקשה על השרת שלנו ולכן צריך את אפ
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = __importDefault(require("../models/post_model"));
//variables for testing
const firstPostMessage = "this is the first new test post message";
const firstPostSender = "999000";
const secondPostMessage = "this is the second new test post message";
const secondPostSender = "888000";
let receivedFirstPostId = "";
let receivedSecondPostId = "";
const newPostMessageUpdated = "this is the updated first new test post message !!!";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
    mongoose_1.default.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
}));
describe("GET / ", () => {
    test("add new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post("/post").send({
            message: firstPostMessage,
            sender: firstPostSender,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(firstPostMessage);
        expect(response.body.sender).toEqual(firstPostSender);
        receivedFirstPostId = response.body._id;
    }));
    test("add new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post("/post").send({
            message: secondPostMessage,
            sender: secondPostSender,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(secondPostMessage);
        expect(response.body.sender).toEqual(secondPostSender);
        receivedSecondPostId = response.body._id;
    }));
    test("get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get("/post");
        expect(response.statusCode).toEqual(200);
        expect(response.body[0].message).toEqual(firstPostMessage);
        expect(response.body[0].sender).toEqual(firstPostSender);
    }));
    test("get post by Id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get("/post/" + receivedFirstPostId);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(firstPostMessage);
        expect(response.body.sender).toEqual(firstPostSender);
    }));
    test("get post by wrong id fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get("/post/12345");
        expect(response.statusCode).toEqual(400);
    }));
    test("get post by sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get("/post?sender=" + secondPostSender);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body[0].message).toEqual(secondPostMessage);
        expect(response.body[0].sender).toEqual(secondPostSender);
        expect(response.body[0]._id).toEqual(receivedSecondPostId);
    }));
    // test("update post by Id", async () => {
    //     let response = await request(app)
    //         .put("/post/" + receivedFirstPostId)
    //         .send({
    //             message: newPostMessageUpdated,
    //             sender: firstPostSender,
    //         });
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.body.message).toEqual(newPostMessageUpdated);
    //     expect(response.body.sender).toEqual(firstPostSender);
    //     response = await request(app).get("/post/" + receivedFirstPostId);
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.body.message).toEqual(newPostMessageUpdated);
    //     expect(response.body.sender).toEqual(firstPostSender);
    //     response = await request(app).put("/post/12345").send({
    //         message: newPostMessageUpdated,
    //         sender: firstPostSender,
    //     });
    //     expect(response.statusCode).toEqual(400);
    //     response = await request(app)
    //         .put("/post/" + receivedFirstPostId)
    //         .send({
    //             message: newPostMessageUpdated,
    //         });
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.body.message).toEqual(newPostMessageUpdated);
    //     expect(response.body.sender).toEqual(firstPostSender);
    // });
});
//# sourceMappingURL=post.test.js.map