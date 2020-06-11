var express = require('express');
var app = require('express')();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = 0;
var hostTimestamp;
var currentSeconds;
var videoID;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log("a user connected");
    users += 1;
    console.log("# of users: " + users);

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      users -= 1;
      console.log("# of users: " + users);
    });
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    socket.on("stop", () => {
      console.log("video is stopped");
      io.emit("stop");
    });
    socket.on("play", () => {
      console.log("video is playing");
      io.emit("play");
    });
    socket.on("pause", () => {
      console.log("video is paused");
      io.emit("pause");
    });
    socket.on("host", (data) => {
      console.log("host is logged in: ", data);
      hostTimestamp = data;
      io.emit("host");
    });
    socket.on("user", () => {
      console.log("user is logged in");
      io.emit("video id", videoID);
      io.emit("user", hostTimestamp);
    });
    socket.on("video id", (id) => {
      console.log(id);
      videoID = id;
      io.emit("video id", id);
    });
  });

http.listen(3000, () => {
  console.log('listening on *:3000');
});