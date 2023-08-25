"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.Deck = void 0;
var Deck = /** @class */ (function () {
    function Deck(shuffled) {
        this.numCards = 52;
        this.cards = [];
        for (var i = 0; i < 52; i++) {
            this.cards.push(new Card(i));
        }
        if (shuffled) {
            this.shuffle();
        }
    }
    Deck.prototype.drawCard = function () {
        this.numCards--;
        var card = this.cards[this.numCards];
        return card;
    };
    Deck.prototype.shuffle = function () {
        // Simulate shuffling by taking two random indices and swapping their contents.
        for (var s = 0; s < 500; s++) {
            var i = Math.floor(Math.random() * 52);
            var j = Math.floor(Math.random() * 52);
            var temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    };
    return Deck;
}());
exports.Deck = Deck;
var Card = /** @class */ (function () {
    function Card(id) {
        this.id = id;
        this.rank = id % 13 + 2;
        this.rankStr = Card.findRankString(this.rank);
        this.suit = Math.floor(id / 13);
        this.suitStr = Card.findSuitString(this.suit);
        this.imgStr = "/images/" + this.rankStr + "_of_" + this.suitStr + ".png";
    }
    Card.findRankString = function (rankNum) {
        if (rankNum == 11) {
            return "jack";
        }
        else if (rankNum == 12) {
            return "queen";
        }
        else if (rankNum == 13) {
            return "king";
        }
        else if (rankNum == 14) {
            return "ace";
        }
        else {
            return "" + rankNum;
        }
    };
    Card.findSuitString = function (suitNum) {
        if (suitNum == 0) {
            return "hearts";
        }
        else if (suitNum == 1) {
            return "spades";
        }
        else if (suitNum == 2) {
            return "diamonds";
        }
        else if (suitNum == 3) {
            return "clubs";
        }
        else {
            return "invalid";
        }
    };
    return Card;
}());
exports.Card = Card;
