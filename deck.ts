export class Deck {
    private cards: Card[];
    numCards: number;

    constructor(shuffled: boolean) {
        this.numCards = 52;
        this.cards = [];

        for (let i = 0; i < 52; i++) {
            this.cards.push(new Card(i));
        }
    
        if (shuffled) {
            this.shuffle();
        }

    }

    drawCard() : Card {
        this.numCards--;
        let card = this.cards[this.numCards];
        return card;
    }

    shuffle() : void {
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

export class Card {
    id: number;
    rank: number;
    rankStr: string;
    suit: number;
    suitStr: string;
    imgStr: string;

    constructor(id: number) {
        this.id = id;
        this.rank = id % 13 + 2;
        this.rankStr = Card.findRankString(this.rank);
        this.suit = Math.floor(id / 13);
        this.suitStr = Card.findSuitString(this.suit);
        this.imgStr = "/images/" + this.rankStr + "_of_" + this.suitStr + ".png";
    }

    static findRankString(rankNum: number): string {
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
      
    static findSuitString(suitNum: number): string {
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