import {Server} from 'socket.io';
import {Socket} from 'socket.io-client';

import {Deck, Card} from './deck';

interface ServerToClientEvents {
    message: (str: string) => void;
    updateNumUsers: (numUsers: number) => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
    register: (nickname: string) => void;
    start: () => void;
    blake_message: (msg: string) => void;
    fold: () => void;
    call: () => void;
    raise: () => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    nickname: any;
    name: string;
    age: number;
}

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);


const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

const port = process.env.PORT || 5000;


enum States {
  preflop,
  flop,
  turn,
  river,
  end
};

const bigBlind = 2;

let users : any[] = [];
let hands : Card[][] = [];

let d : Deck;
let curTurn = 0;
let pot = 0;
let toCall = bigBlind;

let state = States.preflop;

// Express
app.use("/images", express.static(__dirname + '/images'));

app.get('/', (req: any, res: any) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/login.css', (req: any, res: any) => {
  res.sendFile(__dirname + "/login.css");
})
app.get('/game.css', (req: any, res: any) => {
  res.sendFile(__dirname + "/game.css");
})

app.get('/chat', (req: any, res: any) => {
  res.sendFile(__dirname + '/chat.html');
})

app.get('/game', (req: any, res: any) => {
  res.sendFile(__dirname + '/game.html');
})

const deckModule = require('./deck.js');

app.get('/drawCard', (req: any, res: any) => {
  let d = new deckModule.Deck(true);
  let card = d.drawCard();
  res.send("<img src =" + card.imgStr + ">");
})

// Socket IO Logic
io.on('connection', (socket: any) => {
  users.push(socket);
  io.emit('updateNumUsers', users.length);
  
  // Detecting emmisions from an arbitrary socket.
  socket.on('register', (name: string) => {
    socket.data.nickname = name;
    console.log(name + " joined the game.");
    io.emit('message', socket.data.nickname + " joined the chat.");
  })
  
  socket.on('disconnect', () => {
    users = users.filter(x => x.id != socket.id);
    io.emit('message', socket.data.nickname + " disconnected.");
    io.emit('updateNumUsers', users.length);
  });
  socket.on('blake_message', (msg: string) => {
    io.emit('message', socket.data.nickname + ": " + msg);
  });

  // Game actions
  socket.on('start', () => {
    d = new Deck(true);
    for (let i = 0; i < users.length; i++) {
      hands[i] = [];
      hands[i][0] = d.drawCard();
    }
    for (let i = 0; i < users.length; i++) {
      hands[i][1] = d.drawCard();
    }   

    for (let i = 0; i < users.length; i++) {
      users[i].emit('deal', hands[i]);
    }

    curTurn = 0;
    for (let i = 0; i < users.length; i++) {
      users[i].data.money = 100;
      users[i].data.folded = false;
      users[i].bet = 0;

      let obj = {money: users[i].data.money, toCall: toCall};

      users[i].emit('updateTurn', users[0].data.nickname);
      users[i].emit('updatePlayer', obj);
      users[curTurn].emit('yourTurn');
    }
  })

  socket.on('fold', () => {
    console.log("FOLD");
    socket.data.folded = true;
    onMove(socket);

  });

  socket.on('call', () => {

    if (socket.data.money < toCall) {
      console.log("you can't do that.");
      return;
    }

    // move their money into the pot.
    socket.data.money -= toCall;
    pot += toCall;
    onMove(socket);
  })

  socket.on('raise', (amt: number) => {

    if (socket.data.money < toCall) {
      console.log("you can't do that.");
      return;
    }

    socket.data.money -= amt;
    pot += amt;
    toCall += amt;
    onMove(socket);
  })

  
});

function onMove(socket: Socket) {
  // the client side already checks this, but we shouldn't assume the client is always right.
  if (socket.id != users[curTurn].id) return;

  // move around the table until someone isn't folded.
  do {
    curTurn++;
  } while (curTurn < users.length && users[curTurn].data.folded);

  // update client data.
  for (let i = 0; i < users.length; i++) {
    let obj = {money: users[i].data.money, toCall: toCall};
    users[i].emit('updatePlayer', obj);
  }
  
  // everyone took their turn, advance the game.
  if (curTurn == users.length) {
    state++;
    curTurn = 0;

    // do the flop.
    if (state == States.flop) {
      
      // burn 1.
      d.drawCard();
      let flop : Card[] = [];
      // deal 3.
      flop.push(d.drawCard()); flop.push(d.drawCard()); flop.push(d.drawCard());

      console.log("FLOP!!!!");
      // tell everyone.
      for (let i = 0; i < users.length; i++) {
        users[i].emit('flop', flop);
        let obj = {money: users[i].data.money, toCall: toCall};

        users[i].emit('updateTurn', users[0].data.nickname);
        users[i].emit('updatePlayer', obj);
      }
      users[curTurn].emit('yourTurn');
    }

    // do the turn
    else if (state == States.turn) {
      // burn 1.
      d.drawCard();
      let turn = d.drawCard();

      // tell everyone.
      for (let i = 0; i < users.length; i++) {
        users[i].emit('turn', turn);
        let obj = {money: users[i].data.money, toCall: toCall};

        users[i].emit('updateTurn', users[0].data.nickname);
        users[i].emit('updatePlayer', obj);
      }
      users[curTurn].emit('yourTurn');
    }

    else if (state == States.river) {
      // burn 1.
      d.drawCard();
      let river = d.drawCard();

      // tell everyone.
      for (let i = 0; i < users.length; i++) {
        users[i].emit('river', river);
        let obj = {money: users[i].data.money, toCall: toCall};

        users[i].emit('updateTurn', users[0].data.nickname);
        users[i].emit('updatePlayer', obj);
      }
      users[curTurn].emit('yourTurn');
    }
    console.log("everyone took their turn");
  }

  // if not, tell everyone who's turn it is.
  else {

    if (everyoneElseFolded(curTurn)) {
      console.log(users[curTurn].data.nickname + " wins.");
      users[curTurn].emit("win");

      users[curTurn].data.money += pot;
      pot = 0;

      let obj = {money: users[curTurn].data.money, toCall: toCall};
      users[curTurn].emit('updatePlayer', obj);

      return;
    }

    users[curTurn].emit('yourTurn');

    for (let i = 0; i < users.length; i++) {
      users[i].emit('updateTurn', users[curTurn].data.nickname);
    }
  }
}

function everyoneElseFolded(index: number) {
  if (users[index].data.folded) return false;

  for (let i = 0; i < users.length; i++) {
    if (i == index) continue;
    if (!users[i].data.folded) return false;
  }

  return true;
}

server.listen(port, () => {
  console.log('listening on localhost:' + port);
});

