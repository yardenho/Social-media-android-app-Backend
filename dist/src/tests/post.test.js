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
const user_model_1 = __importDefault(require("../models/user_model"));
//variables for testing
const firstPostMessage = "this is the first new test post message";
const secondPostMessage = "this is the second new test post message";
let firstPostSender = "";
let receivedFirstPostId = "";
const newPostMessageUpdated = "this is the updated first new test post message !!!";
const userEmail = "user1@gmail.com";
const userPassword = "12345";
let accessToken = "";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
    yield user_model_1.default.remove();
    const res = yield (0, supertest_1.default)(server_1.default).post("/auth/register").send({
        email: userEmail,
        password: userPassword,
    });
    firstPostSender = res.body._id;
}));
function loginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post("/auth/login").send({
            email: userEmail,
            password: userPassword,
        });
        accessToken = response.body.accessToken;
    });
}
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield loginUser();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
    yield user_model_1.default.remove();
    mongoose_1.default.connection.close(); //צריך משום שהקונקשין הזה נשאר פתוח בסוף הטסטים ולכן חייב לסגור אותו
}));
describe("Posts Tests ", () => {
    test("add new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
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
    }));
    test("add another new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
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
    }));
    test("get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post.length).toEqual(2);
    }));
    test("get post by Id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(firstPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
    }));
    test("get post by wrong id fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post/12345")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(400);
    }));
    test("get post by sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post?sender=" + firstPostSender)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post.length).toEqual(2);
    }));
    test("get post by wrong sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post?sender=12345")
            .set("Authorization", "JWT " + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.length).toEqual(0);
    }));
    test("update post by Id", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(server_1.default)
            .put("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken)
            .send({
            message: newPostMessageUpdated,
            sender: firstPostSender,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
        response = yield (0, supertest_1.default)(server_1.default)
            .get("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
        response = yield (0, supertest_1.default)(server_1.default)
            .put("/post/12345")
            .set("Authorization", "JWT " + accessToken)
            .send({
            message: newPostMessageUpdated,
            sender: firstPostSender,
        });
        expect(response.statusCode).toEqual(400);
        response = yield (0, supertest_1.default)(server_1.default)
            .put("/post/" + receivedFirstPostId)
            .set("Authorization", "JWT " + accessToken)
            .send({
            message: newPostMessageUpdated,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
    }));
});
//# sourceMappingURL=post.test.js.map