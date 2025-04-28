const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Generate a unique room ID and send it to the client
  socket.on("createRoom", () => {
    const roomId = uuidv4();
    socket.join(roomId);
    socket.emit("roomCreated", roomId);
    console.log(`Room created: ${roomId}`);
  });

  // Join an existing room
  socket.on("joinRoom", (roomId) => {
    const rooms = io.sockets.adapter.rooms;
    if (rooms.has(roomId)) {
      socket.join(roomId);
      socket.emit("roomJoined", roomId);
      console.log(`User joined room: ${roomId}`);
    } else {
      socket.emit("error", "Room not found or invalid ID");
    }
  });

  // Handle paste event within a room
  socket.on("paste", ({ roomId, data }) => {
    io.to(roomId).emit("update", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});