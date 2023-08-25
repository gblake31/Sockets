"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var deck_1 = require("./deck");
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = new socket_io_1.Server();
var port = process.env.PORT || 5000;
var States;
(function (States) {
    States[States["preflop"] = 0] = "preflop";
    States[States["flop"] = 1] = "flop";
    States[States["turn"] = 2] = "turn";
    States[States["river"] = 3] = "river";
    States[States["end"] = 4] = "end";
})(States || (States = {}));
;
var bigBlind = 2;
var users = [];
var hands = [];
var d;
var curTurn = 0;
var pot = 0;
var toCall = bigBlind;
var state = States.preflop;
// Express
app.use("/images", express.static(__dirname + '/images'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});
app.get('/login.css', function (req, res) {
    res.sendFile(__dirname + "/login.css");
});
app.get('/game.css', function (req, res) {
    res.sendFile(__dirname + "/game.css");
});
app.get('/chat', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
});
app.get('/game', function (req, res) {
    res.sendFile(__dirname + '/game.html');
});
var deckModule = require('./deck.js');
app.get('/drawCard', function (req, res) {
    var d = new deckModule.Deck(true);
    var card = d.drawCard();
    res.send("<img src =" + card.imgStr + ">");
});
// Socket IO Logic
io.on('connection', function (socket) {
    users.push(socket);
    io.emit('updateNumUsers', users.length);
    // Detecting emmisions from an arbitrary socket.
    socket.on('register', function (name) {
        socket.data.nickname = name;
        console.log(name + " joined the game.");
        io.emit('message', socket.data.nickname + " joined the chat.");
    });
    socket.on('disconnect', function () {
        users = users.filter(function (x) { return x.id != socket.id; });
        io.emit('message', socket.data.nickname + " disconnected.");
        io.emit('updateNumUsers', users.length);
    });
    socket.on('blake_message', function (msg) {
        io.emit('message', socket.data.nickname + ": " + msg);
    });
    // Game actions
    socket.on('start', function () {
        d = new deck_1.Deck(true);
        for (var i = 0; i < users.length; i++) {
            hands[i] = [];
            hands[i][0] = d.drawCard();
        }
        for (var i = 0; i < users.length; i++) {
            hands[i][1] = d.drawCard();
        }
        for (var i = 0; i < users.length; i++) {
            users[i].emit('deal', hands[i]);
        }
        curTurn = 0;
        for (var i = 0; i < users.length; i++) {
            users[i].data.money = 100;
            users[i].data.folded = false;
            users[i].bet = 0;
            var obj = { money: users[i].data.money, toCall: toCall };
            users[i].emit('updateTurn', users[0].data.nickname);
            users[i].emit('updatePlayer', obj);
            users[curTurn].emit('yourTurn');
        }
    });
    socket.on('fold', function () {
        console.log("FOLD");
        socket.data.folded = true;
        onMove(socket);
    });
    socket.on('call', function () {
        if (socket.data.money < toCall) {
            console.log("you can't do that.");
            return;
        }
        // move their money into the pot.
        socket.data.money -= toCall;
        pot += toCall;
        onMove(socket);
    });
    socket.on('raise', function (amt) {
        if (socket.data.money < toCall) {
            console.log("you can't do that.");
            return;
        }
        socket.data.money -= amt;
        pot += amt;
        toCall += amt;
        onMove(socket);
    });
});
function onMove(socket) {
    // the client side already checks this, but we shouldn't assume the client is always right.
    if (socket.id != users[curTurn].id)
        return;
    // move around the table until someone isn't folded.
    do {
        curTurn++;
    } while (curTurn < users.length && users[curTurn].data.folded);
    // update client data.
    for (var i = 0; i < users.length; i++) {
        var obj = { money: users[i].data.money, toCall: toCall };
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
            var flop = [];
            // deal 3.
            flop.push(d.drawCard());
            flop.push(d.drawCard());
            flop.push(d.drawCard());
            console.log("FLOP!!!!");
            // tell everyone.
            for (var i = 0; i < users.length; i++) {
                users[i].emit('flop', flop);
                var obj = { money: users[i].data.money, toCall: toCall };
                users[i].emit('updateTurn', users[0].data.nickname);
                users[i].emit('updatePlayer', obj);
            }
            users[curTurn].emit('yourTurn');
        }
        // do the turn
        else if (state == States.turn) {
            // burn 1.
            d.drawCard();
            var turn = d.drawCard();
            // tell everyone.
            for (var i = 0; i < users.length; i++) {
                users[i].emit('turn', turn);
                var obj = { money: users[i].data.money, toCall: toCall };
                users[i].emit('updateTurn', users[0].data.nickname);
                users[i].emit('updatePlayer', obj);
            }
            users[curTurn].emit('yourTurn');
        }
        else if (state == States.river) {
            // burn 1.
            d.drawCard();
            var river = d.drawCard();
            // tell everyone.
            for (var i = 0; i < users.length; i++) {
                users[i].emit('river', river);
                var obj = { money: users[i].data.money, toCall: toCall };
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
            var obj = { money: users[curTurn].data.money, toCall: toCall };
            users[curTurn].emit('updatePlayer', obj);
            return;
        }
        users[curTurn].emit('yourTurn');
        for (var i = 0; i < users.length; i++) {
            users[i].emit('updateTurn', users[curTurn].data.nickname);
        }
    }
}
function everyoneElseFolded(index) {
    if (users[index].data.folded)
        return false;
    for (var i = 0; i < users.length; i++) {
        if (i == index)
            continue;
        if (!users[i].data.folded)
            return false;
    }
    return true;
}
server.listen(port, function () {
    console.log('listening on localhost:' + port);
});
