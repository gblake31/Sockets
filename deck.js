// constuctor function for the card object.
// we are ordering cards like so:
// 2 of spades all the way to ace of spades,
// then 2

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
  
function drawRandomCard() {
    var randomNum = Math.floor(Math.random() * 52);
    var card = new Card(randomNum);
    return card;
}

module.exports = {Card, drawRandomCard};