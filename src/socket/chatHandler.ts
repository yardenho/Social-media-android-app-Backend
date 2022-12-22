import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import postController from "../controllers/post";

export = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
    //message {'to': destination user id,
    //          'nessage': message to send}

    const sendMessage = (payload) => {
        const to = payload.to;
        const message = payload.message;
        const from = socket.data.user;
        io.to(to).emit("chat:message", {
            to: to,
            from: from,
            message: message,
        });
    };

    console.log("register chat handlers");
    socket.on("chat:send_message", sendMessage);
};
