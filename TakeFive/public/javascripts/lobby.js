// Defining variables
var socket;
var gameid;
var playerid;

function create(create) {
    document.getElementById('pname').style.display = "block";
    if (!create) {
        document.getElementById('gcode').style.display = "block";
        document.getElementById('createButton').style.display = "none";
        document.getElementById('joinButton').onclick = function() {setup(false);};
    } else {
        document.getElementById('joinButton').style.display = "none";
        document.getElementById('createButton').onclick = function() {setup(true);};
    }
    document.getElementById('backButton').style.display = "block";
}

function back() {
    // Hide inputs and back button
    document.getElementById('pname').style.display = "none";
    document.getElementById('gcode').style.display = "none";
    document.getElementById('backButton').style.display = "none";
    // Restore button functionality
    document.getElementById('joinButton').onclick = function() {create(false);};
    document.getElementById('createButton').onclick = function() {create(true);};
    // Show both buttons again
    document.getElementById('joinButton').style.display = "block";
    document.getElementById('createButton').style.display = "block";
}

function AvoidSpace(event) {
    var k = event ? event.which : window.event.keyCode;
    if (k == 32) return false;
}

function startgame() {
    socket.emit('start-game', gameid);
}

function setup(creating) {
    let nameentered;
    if (document.getElementById('player_name').value === "") {
        return;
    } else {
        nameentered = document.getElementById('player_name').value;
        gameid = document.getElementById('game_code').value;
    }

    socket = io(location.host);

    if (creating) {
        socket.emit('create-game');
    } else {
        socket.emit('player-name', {name: nameentered, gid: gameid});
    }

    socket.on('join', (gameid) => {
        socket.emit('player-name', {name: nameentered, gid: gameid});
    });

    socket.on('invalid-game', () => {
        alert('That game does not exist!');
    });

    socket.on('game-full', () => {
        alert('This game is full!');
    });

    socket.on('game-started', () => {
        alert('This game has already started!');
    });

    socket.on('player-overview', (players) => {
        for (let player of players) {
            console.log('Player: ' + player.name);
        }
    });

    socket.on('information', (data) => {
        // Set the variables
        playerid = data.playerID;
        gameid = data.gameID;

        // Show the gameID on screen
        document.getElementById('gameid').innerText = gameid;
        document.getElementById('gameoverview').style.display = "flex";
        document.getElementById('welcomebox').style.display = "none";

        // Setup the cookies
        localStorage.setItem("gameID", gameid);
        localStorage.setItem("playerID", playerid);

        console.info("Variable setup complete");
    });

    socket.on('game', () => {
        window.location.pathname = '/play';
    });
}