const player = function (name, playerid) {
    this.name = name;
    this.id = playerid;
    this.score = 66;
    this.cards = [];
    this.online = true;
    this.ready = false;
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
