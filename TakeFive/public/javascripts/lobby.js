// Defining variables
var socket;
var gameid;
var playerid;

M.AutoInit();

function checkRulesDismissed() {
    let dismissed = getCookie("dismissedRules");
    if (dismissed === "") {
        showRulesDiscovery();
        setCookie("dismissedRules", "true", 365);
    }
  }

function showRulesDiscovery() {
    let elems = document.querySelectorAll('.tap-target');
    let instance = M.TapTarget.getInstance(elems[0]);
    instance.open();
}

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
        showError('That game does not exist!');
    });

    socket.on('game-full', () => {
        showError('This game is full!');
    });

    socket.on('game-started', () => {
        showError('This game has already started!');
    });

    socket.on('name-exists', () => {
        showError('This game already has a player with that username!');
    });

    socket.on('player-overview', (players) => {
        showPlayers(players);
    });

    socket.on('information', (data) => {
        // Set the variables
        playerid = data.playerID;
        gameid = data.gameID;

        // Show the gameID and players on screen
        document.getElementById('gameid').innerText = gameid;
        document.getElementById('game-info').style.display = "flex";
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

function showPlayers(players) {
    let pcontainer = document.getElementById('users-overview');
    pcontainer.innerHTML = '';
    for (let player of players) {
        let pdiv = document.createElement('div');
        pdiv.classList.add('player-box', 'card', 'z-depth-3');
        pdiv.innerText = player.name;
        pcontainer.append(pdiv);
    }
}

function showError(message) {
    document.getElementById('errortext').innerText = message;
    document.getElementById('modal-error-trigger').click();
}

/**
 * Get a cookie by name
 * @param {string} cname The name of the cookie
 */
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

/**
 * This function will set a cookie in the browser
 * @param {string} cname The name of the cookie
 * @param {string} cvalue The value of the cookie
 * @param {number} exdays The days after which the cookie will expire
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}