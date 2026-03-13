import { createServer } from "http"
import { Server } from "socket.io"
import { registerTaskEvents } from "./task-events"
import { registerNotificationEvents } from "./notification-events"
import { startCronJobs } from "@/lib/cron"

const httpServer = createServer()

const io = new Server(httpServer, {
    cors: { origin: "*" }
})


io.on("connection", (socket) => {
    registerNotificationEvents(io, socket)
    registerTaskEvents(io, socket)
})

startCronJobs()

httpServer.listen(4000, () => {
    console.log("Socket server running on 4000")
})