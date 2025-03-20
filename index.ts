// @ts-nocheck

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./dal/db";
import ChatService from "./bl/mongoService";
import { generateId } from "./bl/utils/uuid";
import fs from "fs";

const app = express();

const sslOptions = {
    key: fs.readFileSync("./key.pem"), 
    cert: fs.readFileSync("./cert.pem") 
};

const httpServer = createServer(sslOptions, app);
connectDB();
const io = new Server(httpServer, { 
    cors: {
        origin: "*"
    }
 }); 

io.on("connection", (socket) => {
    const chatService = new ChatService()

    console.log("socket is active and connected")

    socket.on("joinChat", (chatId) => {
        console.log(`User joined chat room: ${chatId}`);
        socket.join(chatId)
    });

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

    socket.on("sendMessage", async (chatId, text, sendingUser) => {
        try {
            const updatedChat = await chatService.addMessageToChat(chatId, text, sendingUser);
            if (updatedChat) {
                console.log(" ")
                console.log(" ")
                console.log(updatedChat)
                io.to(chatId).emit("newMessage", { success: true, messages: updatedChat.messages });
            } else {
                socket.emit("chatError", { success: false, error: "Failed to send message", status: 500 });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("chatError", { success: false, error: "Internal Server Error", status: 500 });
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

    socket.on("fetchUserChats", async (user) => {
        try {
            const chats = await chatService.getAllChats();
            const userChats = chats.filter(chat => chat.users.includes(user));
            socket.emit("userChats", { success: true, chats: userChats });
        } catch (error) {
            console.error("Error fetching user chats:", error);
            socket.emit("userChats", { success: false, chats: [], error: "Internal Server Error", status: 500 });
        }
    }

)})

const serverPort = process.env.SERVER_PORT || 8000;
httpServer.listen(serverPort, "0.0.0.0", () => {
    console.log(`Socket server started on port -> ${serverPort}`);
});