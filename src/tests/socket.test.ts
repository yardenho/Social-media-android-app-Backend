import server from "../app";
import mongoose from "mongoose";
import Client, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import request from "supertest";
import Post from "../models/post_model";
import User from "../models/user_model";
import Message from "../models/message_model";

const firstPostMessage = "this is the first new test post message";
const secondPostMessage = "this is the second new test post message";
let newPostId = "";
const newPostMessageUpdated =
    "this is the updated first new test post message !!!";

const userEmail = "user1@gmail.com";
const userPassword = "12345";

const userEmail2 = "user2@gmail.com";
const userPassword2 = "12345";

const message = "hi... test 123";

type Client = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    accessToken: string;
    id: string;
};

function clientSocketConnect(
    clientSocket: Socket<DefaultEventsMap, DefaultEventsMap>
): Promise<string> {
    return new Promise((resolve) => {
        clientSocket.on("connect", () => {
            resolve("1");
        });
    });
}
let client1: Client;
let client2: Client;

const connectUser = async (userEmail: string, userPassword: string) => {
    //needs to register then login and then to connect the client
    const response1 = await request(server).post("/auth/register").send({
        email: userEmail,
        password: userPassword,
    });
    const userId = response1.body._id;

    const response = await request(server).post("/auth/login").send({
        email: userEmail,
        password: userPassword,
    });
    const token = response.body.tokens.accessToken;

    //פתיחת סוקט ללקוח ה-1
    const socket = Client("http://localhost:" + process.env.PORT, {
        auth: {
            token: "barrer " + token,
        },
    });
    await clientSocketConnect(socket);
    const client = { socket: socket, accessToken: token, id: userId };
    return client;
};

describe("my awesome project", () => {
    jest.setTimeout(15000);
    beforeAll(async () => {
        await Post.remove();
        await User.remove();
        await Message.remove();
        client1 = await connectUser(userEmail, userPassword);
        client2 = await connectUser(userEmail2, userPassword2);
    });

    afterAll(async () => {
        client1.socket.close();
        client2.socket.close();
        await Post.remove();
        await User.remove();
        server.close();
        mongoose.connection.close();
    });

    test("should work", (done) => {
        client1.socket.once("echo:echo_res", (arg) => {
            console.log("echo:echo");
            expect(arg.msg).toBe("hello");
            done();
        });
        client1.socket.emit("echo:echo", { msg: "hello" });
    });

    test("Post add new test", (done) => {
        client1.socket.once("post:post.response", (arg) => {
            console.log("on any" + arg.body);
            expect(arg.body.message).toBe(firstPostMessage);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            newPostId = arg.body._id;
            done();
        });
        console.log("test post add new post");
        client1.socket.emit("post:post", {
            message: firstPostMessage,
            sender: client1.id,
            image: "url",
        });
    });

    test("Post add new test by other client", (done) => {
        client2.socket.once("post:post.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(secondPostMessage);
            expect(arg.body.sender).toBe(client2.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post add new post");
        client2.socket.emit("post:post", {
            message: secondPostMessage,
            sender: client2.id,
            image: "url",
        });
    });

    test("Post get all test", (done) => {
        client1.socket.once("post:get.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("ok");
            expect(arg.body.length).toEqual(2);
            done();
        });
        console.log("test post get all");
        client1.socket.emit("post:get", "stam");
    });

    test("Post get by id test", (done) => {
        client1.socket.once("post:get:id.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(firstPostMessage);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post get by id");
        client1.socket.emit("post:get:id", {
            id: newPostId,
        });
    });

    test("Post get by wrong id test", (done) => {
        client1.socket.once("post:get:id.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.err.code).toBe(400);
            expect(arg.status).toBe("fail");
            done();
        });
        console.log("test post get by wrong id");
        client1.socket.emit("post:get:id", {
            id: 12345,
        });
    });

    test("Post get by sender test", (done) => {
        client1.socket.once("post:get:sender.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body[0].message).toBe(firstPostMessage);
            expect(arg.body[0].sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post get by sender");
        client1.socket.emit("post:get:sender", {
            sender: client1.id,
        });
    });

    test("get post by wrong sender", (done) => {
        client1.socket.once("post:get:sender.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("ok");
            expect(arg.body.length).toEqual(0);
            done();
        });
        console.log("test post get by wrong sender");
        client1.socket.emit("post:get:sender", {
            sender: 12345,
        });
    });

    test("Post put by id test - update message and sender", (done) => {
        client1.socket.once("post:put.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(newPostMessageUpdated);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post put by id");
        client1.socket.emit("post:put", {
            id: newPostId, //check if teher is a way to send the id as parameter
            message: newPostMessageUpdated,
            sender: client1.id,
            image: "url",
        });
    });

    test("Post put by id test check", (done) => {
        client1.socket.once("post:get:id.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(newPostMessageUpdated);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post get by id");
        client1.socket.emit("post:get:id", {
            id: newPostId,
        });
    });

    test("Post put by wrong id test", (done) => {
        client1.socket.once("post:put.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("fail");
            done();
        });
        console.log("test post put by id");
        client1.socket.emit("post:put", {
            id: 123456, //check if teher is a way to send the id as parameter
            message: newPostMessageUpdated,
            sender: client1.id,
        });
    });

    test("Post put by id test - update message", (done) => {
        client1.socket.once("post:put.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(newPostMessageUpdated);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post put by id");
        client1.socket.emit("post:put", {
            id: newPostId, //check if teher is a way to send the id as parameter
            message: newPostMessageUpdated,
        });
    });

    //Chat tests

    test("test chat send message", (done) => {
        client2.socket.once("chat:message", (arg) => {
            expect(arg.to).toBe(client2.id);
            expect(arg.message).toBe(message);
            expect(arg.from).toBe(client1.id);
            expect(arg.res.status).toBe("ok");
            console.log("new message id === " + arg.res.body._id); // message id

            done();
        });
        console.log("test chat send message");

        client1.socket.emit("chat:send_message", {
            to: client2.id,
            message: message,
        });
    });

    test("test chat send message with no message", (done) => {
        client2.socket.once("chat:message", (arg) => {
            expect(arg.res.status).toBe("fail");

            done();
        });
        console.log("test chat send message");

        client1.socket.emit("chat:send_message", {
            to: client2.id,
        });
    });

    test("test chat get all messages that send by user", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(1);
            expect(arg.body[0].reciver).toBe(client2.id);
            expect(arg.body[0].body).toBe(message);
            expect(arg.body[0].sender).toBe(client1.id);
            expect(arg.status).toBe("ok");

            done();
        });
        console.log("test chat get all messages");

        client1.socket.emit("chat:get_all", {
            sender: client1.id,
        });
    });

    test("test chat get all messages that send to user", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(0);
            expect(arg.status).toBe("ok");

            done();
        });
        console.log("test chat get all messages");

        client1.socket.emit("chat:get_all", {
            reciver: client1.id,
        });
    });

    test("test chat get all messages that send by user that did not send any message", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(0);
            expect(arg.status).toBe("ok");

            done();
        });
        console.log("test chat get all messages");

        client1.socket.emit("chat:get_all", {
            sender: client1.id + 2,
        });
    });

    test("test chat get all messages ", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(1);
            expect(arg.status).toBe("ok");

            done();
        });
        console.log("test chat get all messages");

        client1.socket.emit("chat:get_all");
    });
});
