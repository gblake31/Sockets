const socket = io();
socket.emit('register', localStorage.getItem('nickname'));

let yourTurn = false;

let hand1 = document.getElementById("hand1");
let hand2 = document.getElementById("hand2");
socket.on('deal', (hand) => {
    const [card1, card2] = hand;
    hand1.setAttribute('src', card1.imgStr);
    hand2.setAttribute('src', card2.imgStr);
});

let board1 = document.getElementById("board1");
let board2 = document.getElementById("board2");
let board3 = document.getElementById("board3");
socket.on('flop', (cards) => {
    const [card1, card2, card3] = cards;
    board1.setAttribute('src', card1.imgStr);
    board2.setAttribute('src', card2.imgStr);
    board3.setAttribute('src', card3.imgStr);
});

let board4 = document.getElementById("board4");
socket.on('turn', (card) => {
    board4.setAttribute('src', card.imgStr);
});

let board5 = document.getElementById("board5");
socket.on('river', (card) => {
    board5.setAttribute('src', card.imgStr);
});



socket.on('message', (msg) => {
    const messages = document.getElementById('messages');
    const newMessage = document.createElement("p");
    newMessage.textContent = msg;
    messages.appendChild(newMessage);
});

socket.on('updateNumUsers', (x) => {
    const numUsers = document.getElementById('numUsers');
    numUsers.textContent = x;
});

socket.on('updateTurn', (x) => {
    console.log("updateTurn =>");
    let whosTurn = document.getElementById('whosTurn');
    whosTurn.textContent = 'It\'s ' + x + "\'s turn.";
});

socket.on('updatePlayer', (obj) => {
    let m = document.getElementById('money');
    m.textContent = '$' + obj.money;

    console.log("update");

    let tc = document.getElementById("toCall");
    tc.textContent = 'To Call: ' + obj.toCall;
});

socket.on('yourTurn', () => {
    yourTurn = true;
});

socket.on("win", () => {
    document.getElementsByTagName('html')[0].classList.add('win');
});

let form = document.getElementById("chatForm");
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const textBox = document.getElementById("text");
    socket.emit('blake_message', textBox.value);

});

function onStart() {
    socket.emit('start');
}

function fold() {
    if (yourTurn) {
        yourTurn = false;
        console.log("FOLD");
        socket.emit('fold');
    }
}

function call() {
    if (yourTurn) {
        yourTurn = false;
        console.log("CALL");
        socket.emit('call');
    }
}

function raise() {
    if (yourTurn) {
        yourTurn = false;
        socket.emit('raise');
    }
}
