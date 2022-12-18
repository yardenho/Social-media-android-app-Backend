import server from "../app";
import mongoose from "mongoose";
import Client, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import request from "supertest";
import Post from "../models/post_model";
import User from "../models/user_model";

const userEmail = "user1@gmail.com";
const userPassword = "12345";

const userEmail2 = "user2@gmail.com";
const userPassword2 = "12345";

type Client = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    accessToken: string;
    id: string;
};

function clientSocketConnect(clientSocket): Promise<string> {
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
    const token = response.body.accessToken;

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
    beforeAll(async () => {
        await Post.remove();
        await User.remove();
        client1 = await connectUser(userEmail, userPassword);
        client2 = await connectUser(userEmail2, userPassword2);
    });

    afterAll(() => {
        client1.socket.close();
        client2.socket.close();
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

    test("Post get all test", (done) => {
        client1.socket.once("post:get_all", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("OK");
            done();
        });
        console.log("test post get all");
        client1.socket.emit("post:get_all", "stam");
    });

    test("test chat messages", (done) => {
        const message = "hi... test 123";
        client2.socket.once("chat:message", (arg) => {
            expect(arg.to).toBe(client2.id);
            expect(arg.message).toBe(message);
            expect(arg.from).toBe(client1.id);
            done();
        });
        console.log("test post get all");

        client1.socket.emit("chat:send_message", {
            to: client2.id,
            message: message,
        });
    });
});
