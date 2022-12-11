import server from "../app";
import mongoose from "mongoose";
import Client, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import request from "supertest";
import Post from "../models/post_model";
import User from "../models/user_model";

const userEmail = "user1@gmail.com";
const userPassword = "12345";
let accessToken = "";
let clientSocket: Socket<DefaultEventsMap, DefaultEventsMap>;

function clientSocketConnect(): Promise<string> {
    return new Promise((resolve) => {
        clientSocket.on("connect", () => {
            resolve("1");
        });
    });
}

describe("my awesome project", () => {
    beforeAll(async () => {
        await Post.remove();
        await User.remove();
        //needs to register then login and then to connect the client
        await request(server).post("/auth/register").send({
            email: userEmail,
            password: userPassword,
        });

        const response = await request(server).post("/auth/login").send({
            email: userEmail,
            password: userPassword,
        });
        accessToken = response.body.accessToken;

        clientSocket = Client("http://localhost:" + process.env.PORT, {
            auth: {
                token: "barrer " + accessToken,
            },
        });
        await clientSocketConnect();
    });

    afterAll(() => {
        server.close();
        clientSocket.close();
        mongoose.connection.close();
    });

    test("should work", (done) => {
        clientSocket.removeAllListeners();
        clientSocket.on("echo:echo", (eventName, arg) => {
            console.log("echo:echo");
            expect(eventName).toBe("echo:echo");
            expect(arg.msg).toBe("hello");
            done();
        });
        clientSocket.emit("echo:echo", { msg: "hello" });
    });

    test("Post get all test", (done) => {
        clientSocket.removeAllListeners();
        clientSocket.on("post:get_all", (eventName, arg) => {
            console.log("post:get_all" + arg);
            expect(eventName).toBe("post:get_all");
            expect(arg.status).toBe("OK");
            done();
        });
        console.log("test post get all");
        clientSocket.emit("post:get_all", "stam");
    });
});
