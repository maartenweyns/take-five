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
    // The game board
    this.row0 = [];
    this.row1 = [];
    this.row2 = [];
    this.row3 = [];
    // Store the selected cards at the end of a round
    this.selectedCards = [];
};

game.prototype.getID = function () {
    return this.id;
};

game.prototype.getPlayers = function () {
    return this.players;
};

game.prototype.getOpenCards = function () {
    return [this.row0, this.row1, this.row2, this.row3];
};

game.prototype.getStatus = function () {
    return this.state;
};

game.prototype.player = function(playerID) {
    return this.players[playerID];
};

game.prototype.getPlayerInformation = function () {
    let returnvalue = [];
    for (let player of this.players) {
        returnvalue.push({name: player.getName(), score: player.getScore()});
    }
    return returnvalue;
};

game.prototype.startGame = function () {
    // Set game state to ongoing
    this.state = 'ongoing';
    // Give all players cards
    this.givePlayersCards();
    // Get starting cards
    for(let i = 0; i < 4; i++) {
        this[`row${i}`].push(this.takeAvailableCard());
    }
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

game.prototype.finishRound = function () {
    for (let player of this.players) {
        this.selectedCards.push({pid: player.getID(), name: player.getName(), num: player.getSelectedCard()});
    }
    this.selectedCards.sort(compareNumReverse);
};

game.prototype.getSelectedCards = function () {
    return this.selectedCards;
};

game.prototype.getSmallestRowBeginning = function () {
    return Math.min(this.row0[0], this.row1[0], this.row2[0], this.row3[0]);
};

game.prototype.determineRowForCard = function (card) {
    console.log(`[INFO] Determining location for ${card}`)

    let lowestDifference = 999;
    let rownum = 999;
    for (let i = 0; i < 4; i++) {
        let row = this[`row${i}`];
        // Get the last number of the row
        let number = row.pop()
        row.push(number);
        // Get the absolute value of the difference
        let difference = card - number;
        // Set the minimal difference to the new minimum
        if (difference > 0 && difference < lowestDifference) {
            lowestDifference = difference;
            // Set the row to the row containing the minimal difference
            rownum = i;
        }
    }
    return rownum;
};

function compareNumReverse(a, b) {
    if (a.num < b.num) {
        return 1;
    }
    if (a.num > b.num) {
        return -1;
    }
    return 0;
}

module.exports = game;