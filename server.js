const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 5000;
const BOT_NAME = "Bot";

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {});

server.listen(PORT, () => {
  console.log(`Listening in port ${PORT}`);
});

// Socket io
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcoming user
    socket.emit(
      "message",
      formatMessage(BOT_NAME, "You are connected to Chatbot")
    );

    // Message when somebody connects to a chatroom
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(BOT_NAME, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  // Message when somebody disconnects to a chatroom
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(BOT_NAME, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
