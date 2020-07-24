const Player = require("./player");
const Utils = require("./utils");

const game = function (gameid) {
    this.id = gameid;
    this.players = [];

    // Make it the first round
    this.round = 1;
    // Put all cards as available
    this.availableCards = Utils.allCards;
    // Set the state to "lobby"
    this.state = "lobby";
};

game.prototype.getPlayers = function () {
    return this.players;
};

game.prototype.startGame = function () {
    // Set game state to ongoing
    this.state = 'ongoing';
    // Give all players cards
    this.givePlayersCards();
};

game.prototype.setPlayerReady = function (pid, ready) {
    if(this.players[pid] !== undefined) {
        this.players[pid].setReady(ready);
    }
};

game.prototype.allPlayersReady = function () {
    for (let player of this.players) {
        if (!player.isReady()) {
            return false;
        }
    }
    return true;
};

game.prototype.addPlayer = function (name) {
    if (this.players.length < 10) {
        let player = new Player(name, this.players.length);
        this.players.push(player);
        return {id: player.id};
    } else {
        return false;
    }
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
};

game.prototype.givePlayersCards = function () {
    for (let player of this.players) {
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