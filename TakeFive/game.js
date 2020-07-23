const Player = require("./player");
const Utils = require("./utils");

const game = function (gameid) {
    this.id = gameid;
    this.players = [];

    // Make it the first round
    this.round = 1;

    this.availableCards = Utils.allCards;
};

game.prototype.takeAvailableCard = function () {
    let card = Utils.randomFromInterval(1, 104);
    if (this.availableCards.includes(card)) {
        this.removeCardFromAvailable(card);
        return card;
    } else {
        return this.takeAvailableCard();
    }
};

game.prototype.removeCardFromAvailable = function (card) {
    let index = this.availableCards.indexOf(card);
    if (index > -1) {
        this.availableCards.splice(index, 1);
        return true;
    }
    return false;
}

game.prototype.givePlayersCards = function () {
    for (let player of players) {
        if (player.online) {
            let cards = [];
            for (let i = 0; i < 10; i++) {
                let card = this.takeAvailableCard();
                cards.push(card);
            }
            player.setCards(cards);
        }
    }
};

module.exports = game;