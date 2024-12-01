const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const Message = require("../models/chat");

// Chat Routes for specific community
router.get("/community/:communityId/chat", chatController.chat);
router.post("/community/:communityId/chat", chatController.createMessage);

// Socket.IO Setup
const initializeSocket = (server) => {
    const socketIo = require("socket.io");
    const io = socketIo(server);

    io.on("connection", (socket) => {
        console.log("New user connected");

        socket.on("sendMessage", async (data) => {
            try {
                const newMessage = new Message({
                    username: data.username,
                    message: data.message,
                    community: data.communityId
                });
                await newMessage.save();
                
                // Broadcast to all users in the same community
                io.to(data.communityId).emit("newMessage", data);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        // Join a community-specific room
        socket.on("joinCommunity", (communityId) => {
            socket.join(communityId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
};

module.exports = { router, initializeSocket };