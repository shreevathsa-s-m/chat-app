const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: { origin: "*" }
});

// API endpoint for old messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await db.getMessages();
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "DB error" });
  }
});

// WebSocket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", async (msg) => {
    await db.saveMessage(msg.username, msg.message);
    io.emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start backend server
server.listen(3000, () => {
  console.log("Backend running at http://localhost:3000");
});
