const player = function (name, playerid, socketid) {
    this.name = name;
    this.id = playerid;
    this.socketid = socketid;
    this.score = 66;
    this.cards = [];
    this.online = true;
    this.ready = false;
    this.selectedCard = 0;

    // Initialize a penalty cards array
    this.penaltyCards = [];
    this.scoreWillChange = false;
};

player.prototype.getID = function () {
    return this.id;
};

player.prototype.getSocketID = function () {
    return this.socketid;
};

player.prototype.getScore = function () {
    return this.score;
};

player.prototype.getName = function () {
    return this.name;
};

player.prototype.getPenaltyCards = function () {
    return this.penaltyCards;
};

player.prototype.resetPenaltyCards = function () {
    this.penaltyCards = [];
};

/**
 * This function returns whether or not the score of the player will change
 * @returns {boolean} True if the player's score will change, false if it won't
 */
player.prototype.getScoreChanging = function () {
    return this.penaltyCards.length !== 0;
};

player.prototype.isOnline = function () {
    return this.online;
};

player.prototype.isReady = function () {
    return this.ready;
};

player.prototype.setReady = function (ready) {
    this.ready = ready;
};

player.prototype.getSelectedCard = function () {
    return this.selectedCard;
};

player.prototype.setSelectedCard = function (card) {
    this.selectedCard = card;
    // Remove the selected card form their collection
    let index = this.cards.indexOf(card);
    if (index > -1) {
        this.cards.splice(index,1);
    }
    // After confirming a card, the player is considered ready
    this.setReady(true);
};

player.prototype.decrementScore = function (amount) {
    this.score -= amount;
};

player.prototype.setCards = function (array) {
    this.cards = array;
    this.cards.sort((a, b) => a - b);
};

player.prototype.getCards = function () {
    return this.cards;
};

player.prototype.updateSocketID = function (sid) {
    this.socketid = sid;
};

/**
 * This method will add provided cards to the array of penalty cards for a given user.
 * @param {array} cards The array of cards to add as penalty cards.
 */
player.prototype.addPenaltyCards = function (cards) {
    for (let card of cards) {
        this.penaltyCards.push(card);
    }
};

module.exports = player;
