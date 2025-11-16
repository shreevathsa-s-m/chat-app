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

// ===========================
// REAL-TIME SOCKET.IO EVENTS
// ===========================

let onlineUsers = {};   // { socketId: username }

// WebSocket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When frontend sends username after joining
  socket.on("join", (username) => {
    onlineUsers[socket.id] = username;

    // Send updated online list + count
    io.emit("online_users", {
      count: Object.keys(onlineUsers).length,
      users: Object.values(onlineUsers),
    });
  });

  // When a new message is sent
  socket.on("send_message", async (msg) => {
    await db.saveMessage(msg.username, msg.message);
    io.emit("receive_message", msg);
  });

  // When user disconnects / closes tab
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete onlineUsers[socket.id];

    // Update others after disconnect
    io.emit("online_users", {
      count: Object.keys(onlineUsers).length,
      users: Object.values(onlineUsers),
    });
  });
});

// Render-friendly port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
