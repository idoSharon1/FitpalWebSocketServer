import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: "*"
    }
 }); 

io.on("connection", (socket) => {
    console.log("socket is active and connected")

    socket.on("chat", (payload) => {
        io.emit("chat", payload)
    })
})

const serverPort = process.env.SERVER_PORT || 8000;
httpServer.listen(serverPort);
console.log(`socket server started on port -> ${serverPort}`)