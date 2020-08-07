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
    // Indicate who has to choose a row, or -1 if nobody should
    this.choosingRow = -1;
};

/**
 * This function returns the ID of the game.
 * @returns {string} The gameID of the current game
 */
game.prototype.getID = function () {
    return this.id;
};

/**
 * This function will return the array of players currently in the game.
 * @returns {array} The array of users in the game
 */
game.prototype.getPlayers = function () {
    return this.players;
};

/**
 * This function will construct and return a 2D array of all the open cards.
 * @returns {array} An array which has the rows of cards as its elements
 */
game.prototype.getOpenCards = function () {
    return [this.row0, this.row1, this.row2, this.row3];
};

/**
 * This function returns the game state at this moment in time
 * @returns {string} "lobby" if the game has not started yet, "ongoing" if it has
 */
game.prototype.getStatus = function () {
    return this.state;
};

/**
 * This function returns the player object of the player with the ID specified.
 * Calling this function allows to execute functions on the player object as if you were accessing this object directly.
 * @param {number} playerID The ID of the player.
 * @returns {object} The player object of the player with the provided ID.
 */
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

game.prototype.setChoosingRow = function (pid) {
    this.choosingRow = pid;
};

game.prototype.getChoosingRow = function () {
    return this.choosingRow;
}

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

/**
 * This function return the smallest card form the game (i.e. the smallest card of the first cards of all rows).
 * @returns {number} The smallest card of the game.
 */
game.prototype.getSmallestRowBeginning = function () {
    return Math.min(this.row0[0], this.row1[0], this.row2[0], this.row3[0]);
};

/**
 * This function will look for the correct row on which to place the given card and it will place it there.
 * @param {number} card The card to place on the correct row.
 */
game.prototype.placeCardOnRow = function (card) {
    let lowestDifference = 999;
    let rownum = -1;
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
    if (this.addCardToRow(card, rownum)) {
        return rownum;
    } else {
        return false;
    }
};

game.prototype.playerTookRow = function (pid, row, card) {
    if (0 <= row < 4) {
        // Calculate the penalty for taking the row
        let penalty = this.calculatePenalty(this[`row${row}`]);
        // Decrement the players score with the penalty
        this.player(pid).decrementScore(penalty);
        
    }
};

/**
 * This method will calculate the total amount of penalty points of a row
 * @param {array} row The row of card to calculate the penalty of
 */
game.prototype.calculatePenalty = function (row) {
    let penalty = 0;
    for (let card of row) {
        if (card % 55 === 0) {
            penalty += 7;
            continue;
        }
        if (card % 11 === 0) {
            penalty += 5;
            continue;
        }
        if (card % 10 === 0) {
            penalty += 3;
            continue;
        }
        if (card % 5 === 0) {
            penalty += 2;
            continue;
        }
        penalty += 1;
    }
    return penalty;
};

/**
 * This function adds a card to the given row (0, 1, 2 or 3).
 * This function does not check for the validity of this move.
 * @param {number} card The card to add to the given row
 * @param {number} row The row to which to add the card
 */
game.prototype.addCardToRow = function (card, row) {
    if (row < 0 || row > 3) {
        return false;
    }
    this[`row${row}`].push(card);
    return true;
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