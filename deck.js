
// Constructor for the Deck Object.
// A deck contains 52 cards, which can be ordered or shuffled
function Deck(shuffled) {
    this.shuffle = function() {

        // Simulate shuffling by taking two random indices and swapping their contents.
        for (let s = 0; s < 500; s++) {
            let i = Math.floor(Math.random() * 52);
            let j = Math.floor(Math.random() * 52);
            
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

    // Draw from the top of the stack, and decrement the stack pointer.
    this.drawCard = function() {
        this.numCards--;
        let card = this.cards[this.numCards];
        return card;
    }

    this.numCards = 52;
    this.cards = [];
    for (let i = 0; i < 52; i++) {
        this.cards.push(new Card(i));
    }

    if (shuffled) {
        this.shuffle();
    }
}

// Constructor Function for the Card Object.
// suit order is "hearts spades diamonds clubs"
function Card (id) {
    this.id = id;
    this.rank = id % 13 + 2;
    this.rankStr = findRankString(this.rank);
    this.suit = Math.floor(id / 13);
    this.suitStr = findSuitString(this.suit);
    this.imgStr = "/images/" + this.rankStr + "_of_" + this.suitStr + ".png";
}


function findRankString(rankNum) {
    if (rankNum == 11) {
        return "jack";
    } else if (rankNum == 12) {
        return "queen";
    } else if (rankNum == 13) {
        return "king";
    } else if (rankNum == 14) {
        return "ace";
    } else {
        return "" + rankNum;
    }
}
  
function findSuitString(suitNum) {
    if (suitNum == 0) {
        return "hearts";
    } else if (suitNum == 1) {
        return "spades";
    } else if (suitNum == 2) {
        return "diamonds";
    } else if (suitNum == 3) {
        return "clubs";
    } else {
        return "invalid";
    }
}
  

module.exports = {Deck, Card};