const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () => console.log(`Server started on ${process.env.PORT}`) );

mongoose.connect(process.env.MONGO_URL,  {useNewUrlParser: true, useUnifiedTopology: true,}).then( () => console.log("DB Connetion Successfull")) .catch(err =>  console.log(err.message) );


global.onlineUsers = new Map();

const socket = require("socket.io");

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});


io.on("connection", socket => {
  global.chatSocket = socket;
  socket.on("add-user", userId => onlineUsers.set(userId, socket.id) )
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) socket.to(sendUserSocket).emit("msg-recieve", data.msg);
  });
});
