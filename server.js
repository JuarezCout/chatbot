const express = require("express");
const app = express();
const http = require("http").createServer(app);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

http.listen(PORT, () => {
  console.log(`Listening in port ${PORT}`);
});

// Socket io

const io = require("socket.io")(http);
io.on("connection", (socket) => {
  console.log("connected to socket io");
});
