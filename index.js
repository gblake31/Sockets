const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 5000;

let users = [];
let hands = [];

app.use("/images", express.static(__dirname + '/images'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/login.css', (req, res) => {
  res.sendFile(__dirname + "/login.css");
})
app.get('/game.css', (req, res) => {
  res.sendFile(__dirname + "/game.css");
})

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
})

app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/game.html');
})

const deckModule = require('./deck.js');

app.get('/drawCard', (req, res) => {
  let d = new deckModule.Deck(true);
  console.log(d);
  let card = d.drawCard();
  res.send("<img src =" + card.imgStr + ">");
})

// Socket IO Logic

io.on('connection', (socket) => {
  console.log(socket.id);
  users.push(socket);
  io.emit('updateNumUsers', users.length);

  socket.on('register', (name) => {
    socket.data.nickname = name;
    io.emit('message', socket.data.nickname + " joined the chat.");
  })
  // Detecting emmisions from an arbitrary socket.
  socket.on('disconnect', () => {
    users = users.filter(x => x != socket);
    io.emit('message', socket.data.nickname + " disconnected.");
    io.emit('updateNumUsers', users.length);
  });
  socket.on('blake_message', (msg) => {
    io.emit('message', socket.data.nickname + ": " + msg);
  });


  // Game actions
  socket.on('start', () => {
    let d = new deckModule.Deck(true);
    for (let i = 0; i < users.length; i++) {
      hands[i] = [d.drawCard(), d.drawCard()];
    }

    for (let i = 0; i < users.length; i++) {
      users[i].emit('deal', hands[i]);
    }
  })
});

server.listen(port, () => {
  console.log('listening on localhost:' + port);
});

