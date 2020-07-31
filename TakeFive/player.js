const player = function (name, playerid) {
    this.name = name;
    this.id = playerid;
    this.score = 66;
    this.cards = [];
    this.online = true;
    this.ready = false;
    this.selectedCard = 0;
};

player.prototype.getID = function () {
    return this.id;
};

player.prototype.getScore = function () {
    return this.score;
};

player.prototype.getName = function () {
    return this.name;
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

module.exports = player;
