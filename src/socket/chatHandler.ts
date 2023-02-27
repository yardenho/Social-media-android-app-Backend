import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import messageController from "../controllers/message";
import request from "../request";

export = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
    //message {'to': destination user id,
    //          'message': message to send}

    const sendMessage = async (payload) => {
        const message = payload.message;
        const from = socket.data.user;
        console.log("in send message chat handler");
        try {
            const response = await messageController.addNewMessage(
                new request(payload, from, null, null)
            );
            console.log("trying to send chat:message");
            io.emit("chat:message", {
                from: from,
                message: message,
                res: response,
            });
        } catch (err) {
            console.log(err);
            socket.emit("chat:message", { status: "fail" });
        }
    };

    const getAllMessages = async (payload) => {
        console.log("in get all messages handler");
        try {
            const response = await messageController.getAllMessages(
                new request(payload, socket.data.user, payload, null)
            );
            console.log("trying to send chat:get_all.response");
            console.log(socket.data.user);

            console.log(response);

            io.to(socket.data.user).emit("chat:get_all.response", response);
        } catch (err) {
            socket.emit("chat:get_all.response", { status: "fail" });
        }
    };

    console.log("register chat handlers");
    socket.on("chat:send_message", sendMessage);
    socket.on("chat:get_all", getAllMessages);
};
