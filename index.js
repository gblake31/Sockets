const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

app.get('/hello', (req, res) => {
  res.send("<h1>Hello World!</h1>");
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('blake_message', (msg) => {
    console.log('message: ' + msg);
    io.emit('different_name', msg);
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});
