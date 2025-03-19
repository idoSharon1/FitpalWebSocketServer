import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./dal/db";
import ChatService from "./bl/mongoService";
import { generateId } from "./bl/utils/uuid";

const app = express();
const httpServer = createServer(app);
connectDB();
const io = new Server(httpServer, { 
    cors: {
        origin: "*"
    }
 }); 

io.on("connection", (socket) => {
    const chatService = new ChatService()

    console.log("socket is active and connected")



    socket.on("fetchMessages", async (chatId) => {

        console.log(chatId)
        try {
            const chat = await chatService.findChatById(chatId);
            if (chat) {
                socket.emit("chatMessages", { success: true, messages: chat.messages })
            } else {
                socket.emit("chatMessages", { success: false, messages: [], error: "Chat not found", status: 404 })
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            socket.emit("chatMessages", { success: false, messages: [], error: "Internal Server Error", status: 500 })
        }
    });

    socket.on("createChat", async (user1, user2) => {
        try {
            const newChat = await chatService.createChat(generateId(), user1, user2);
            if (newChat) {
                io.emit("chatCreated", { success: true, chat: newChat });
            } else {
                socket.emit("chatError", { success: false, error: "Failed to create chat", status: 500 });
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            socket.emit("chatError", { success: false, error: "Internal Server Error", status: 500 });
        }
    });
})

const serverPort = process.env.SERVER_PORT || 8000;
httpServer.listen(serverPort);
console.log(`socket server started on port -> ${serverPort}`)