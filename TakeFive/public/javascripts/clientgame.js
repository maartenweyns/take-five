// Setup variables
var gameid = localStorage.getItem('gameID');
var playerid = localStorage.getItem('playerID');

(function setup() {
    socket = io(location.host);

    socket.emit('ingame-join', {gid: gameid, pid: playerid});

    socket.on('lobby', () => {
        window.location.pathname = "/";
    });

    socket.on('player-overview', (players) => {
        // TODO Implement
    });

    socket.on('own-cards', (cards) => {
        showOwnCards(cards);
    });
})();

function showOwnCards(cards) {
    // Get the card container
    let container = document.getElementById('owncardscontainer');

    // Create a new div for all cards
    for (let card of cards) {
        let cardDiv = document.createElement('div');
        cardDiv.style.backgroundImage = `url(../images/cards/${card}.svg)`;
        container.append(cardDiv);
    }
}