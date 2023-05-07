const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 5000;

app.use("/images", express.static(__dirname + '/images'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/login.css', (req, res) => {
  res.sendFile(__dirname + "/login.css");
})

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
})

io.on('connection', (socket) => {
  console.log(socket.id);

  socket.on('register', (name) => {
    socket.data.nickname = name;
    io.emit('message', socket.data.nickname + " joined the chat.");
  })
  // Detecting emmisions from an arbitrary socket.
  socket.on('disconnect', () => {
    io.emit('message', socket.data.nickname + " disconnected.");
  });
  socket.on('blake_message', (msg) => {
    io.emit('message', socket.data.nickname + ": " + msg);
  });
});

server.listen(port, () => {
  console.log('listening on localhost:' + port);
});
