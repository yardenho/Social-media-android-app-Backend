import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
    const echoHandler = (payload) => {
        socket.emit("echo:echo", payload);
    };
    const readHandler = (payload) => {
        // ...
    };
    console.log("register echo handlers");
    socket.on("echo:echo", echoHandler);
    socket.on("echo:read", readHandler);
};
