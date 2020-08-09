const Player = require("./player");
const Utils = require("./utils");

const game = function (gameid) {
    this.id = gameid;
    this.players = [];

    // Make it the first round
    this.round = 1;
    // Make it the first card of this round
    this.cardInRound = 1;

    this.availableCards = shuffleArray([...Utils.allCards]);
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
    // The card that has last changed
    this.lastChangedCard = 0;
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
 * This function will increase the currect card of the current round by one.
 */
game.prototype.nextCard = function () {
    this.cardInRound++;
};

/**
 * This function returns the current card from this round.
 */
game.prototype.getCardInRound = function () {
    return this.cardInRound;
};

/**
 * This function will construct and return a 2D array of all the open cards.
 * @returns {array} An array which has the rows of cards as its elements
 */
game.prototype.getOpenCards = function () {
    return {cards: [this.row0, this.row1, this.row2, this.row3], last: this.lastChangedCard};
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

/**
 * This function will increment the round by 1
 */
game.prototype.nextRound = function() {
    this.selectedCards = [];
    this.availableCards = shuffleArray([...Utils.allCards]);
    this.calculateNewScores();
    this.givePlayersCards();
    this.initiateRows();
    this.round += 1;
    this.cardInRound = 1;
};

game.prototype.getPlayerInformation = function () {
    let returnvalue = [];
    for (let player of this.players) {
        returnvalue.push({name: player.getName(), score: player.getScore(), penalty: player.getScoreChanging()});
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
    this.initiateRows();
};

/**
 * This function will put one available card on each row.
 */
game.prototype.initiateRows = function () {
    for(let i = 0; i < 4; i++) {
        this[`row${i}`] = [];
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
        if (player.online && player.alive && !player.isReady()) {
            return false;
        }
    }
    return true;
};

game.prototype.getDeadPlayers = function () {
    let array = [];
    for (let player of this.players) {
        if (!player.alive) {
            array.push(player);
        }
    }
    return array;
};

game.prototype.addPlayer = function (name, sid) {
    if (this.players.length < 10) {
        let player = new Player(name, this.players.length, sid);
        this.players.push(player);
        return {id: player.id};
    } else {
        return false;
    }
};

game.prototype.takeAvailableCard = function () {
    return this.availableCards.pop();
};

game.prototype.removeCardFromAvailable = function (card) {
    let index = this.availableCards.indexOf(card);
    if (index > -1) {
        this.availableCards.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * This function will give all online and alive players 10 cards.
 */
game.prototype.givePlayersCards = function () {
    for (let player of this.players) {
        if (player.online && player.alive) {
            let cards = [];
            for (let i = 0; i < 10; i++) {
                let card = this.takeAvailableCard();
                cards.push(card);
            }
            player.setCards(cards);
        }
    }
};

game.prototype.getScores = function () {
    let array = [];
    for (let player of this.players) {
        array.push({pid: player.getID(), score: player.getScore()});
    }
    return array;
};

game.prototype.finishRound = function () {
    for (let player of this.players) {
        if (player.alive) {
            this.selectedCards.push({pid: player.getID(), name: player.getName(), num: player.getSelectedCard()});  
        }
    }
    this.selectedCards.sort(compareNumReverse);
};

game.prototype.getSelectedCards = function () {
    return this.selectedCards;
};

/**
 * This function return the smallest card form the game (i.e. the smallest card of the last cards of each row).
 * @returns {number} The smallest card of the game.
 */
game.prototype.getSmallestCard = function () {
    return Math.min(this.row0[this.row0.length - 1], this.row1[this.row1.length - 1], this.row2[this.row2.length - 1], this.row3[this.row3.length - 1]);
};

/**
 * This function will look for the correct row on which to place the given card and it will place it there.
 * @param {number} card The card to place on the correct row.
 * @param {number} pid The playerID used if the row was already full.
 * @returns {number} The rownumber if it has succeded or false if it failed.
 */
game.prototype.placeCardOnRow = function (card, pid) {
    let lowestDifference = 999;
    let rownum = -1;
    for (let i = 0; i < 4; i++) {
        let row = this[`row${i}`];
        // Get the last number of the row
        let number = row[row.length - 1];

        // Get the absolute value of the difference
        let difference = card - number;

        // Set the minimal difference to the new minimum
        if (difference > 0 && difference < lowestDifference) {
            lowestDifference = difference;
            // Set the row to the row containing the minimal difference
            rownum = i;
        }
    }
    if (this[`row${rownum}`].length >= 5) {
        this.playerTookRow(pid, rownum, card);
        return rownum;
    }
    if (this.addCardToRow(card, rownum)) {
        return rownum;
    } else {
        return false;
    }
};

/**
 * This method will add the provided row of card as penalty cards and replace the row with the card of the player.
 * @param {number} pid The ID of the player
 * @param {number} row The row the player took
 * @param {number} card The card the player is placing
 */
game.prototype.playerTookRow = function (pid, row, card) {
    if (0 <= row < 4) {
        // Add cards from the row to the players penaly cards
        this.player(pid).addPenaltyCards(this[`row${row}`]);
        // Set the row as the new card
        this[`row${row}`] = [card];
        this.lastChangedCard = card;
    }
};

/**
 * This function will update the scores of all players and reset their penalty cards
 */
game.prototype.calculateNewScores = function () {
    for (let player of this.players) {
        let penalty = this.calculatePenalty(player.getPenaltyCards());
        player.decrementScore(penalty);
        player.resetPenaltyCards();
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
 * This function will change the ready state of all players at once.
 * @param {boolean} ready Whether or not the players should be ready
 */
game.prototype.setAllPlayersReady = function (ready) {
    for (let player of this.players) {
        player.setReady(ready);
    }
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
    this.lastChangedCard = card;
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

/**
 * This function will shuffle an array
 * @param {array} array The array to shuffle
 */
function shuffleArray(array) {
    var m = array.length,
        t,
        i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

module.exports = game;