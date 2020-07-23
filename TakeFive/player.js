const player = function (playerid) {
    this.id = playerid;
    this.score = 66;
    this.cards = [];
    this.online = true;   
}

player.prototype.decrementScore = function(amount) {
    this.score -= amount;
}

player.prototype.setCards = function(array) {
    this.cards = array;
}

module.exports = player;