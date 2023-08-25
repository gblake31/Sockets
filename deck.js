class Deck {
    constructor(shuffled) {
        this.numCards = 52;
        this.cards = [];

        for (let i = 0; i < 52; i++) {
            this.cards.push(new Card(i));
        }
    
        if (shuffled) {
            this.shuffle();
        }

    }

    drawCard() {
        this.numCards--;
        let card = this.cards[this.numCards];
        return card;
    }

    shuffle() {
        // Simulate shuffling by taking two random indices and swapping their contents.
        for (let s = 0; s < 500; s++) {
            let i = Math.floor(Math.random() * 52);
            let j = Math.floor(Math.random() * 52);
            
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

}

class Card {

    constructor(id) {
        this.id = id;
        this.rank = id % 13 + 2;
        this.rankStr = Card.findRankString(this.rank);
        this.suit = Math.floor(id / 13);
        this.suitStr = Card.findSuitString(this.suit);
        this.imgStr = "/images/" + this.rankStr + "_of_" + this.suitStr + ".png";
    }

    static findRankString(rankNum) {
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
      
    static findSuitString(suitNum) {
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
}

module.exports = {Card, Deck};