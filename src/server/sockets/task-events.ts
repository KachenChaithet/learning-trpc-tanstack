import { Server, Socket } from "socket.io";

export const registerTaskEvents = (io: Server, socket: Socket) => {
    socket.on('join-task', (taskId: string) => {
        socket.join(taskId)
    })

    socket.on('leave-task', (taskId: string) => {
        socket.leave(taskId)
    })

    socket.on("send-comment", (data) => {
        io.to(data.taskId).emit("new-comment", data)

    })
}