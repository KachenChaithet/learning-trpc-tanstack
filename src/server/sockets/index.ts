import { createServer } from "http";
import { Server } from 'socket.io'
import { registerTaskEvents } from "./task-events";
import { registerNotificationEvents } from "./notification-events";

const httpServer = createServer()

export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
})

io.on('connection', (socket) => {

    registerTaskEvents(io, socket)
    registerNotificationEvents(io, socket)

})

httpServer.listen(4000, () => {
    console.log('Socket server running on port 4000');

})