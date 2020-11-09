/**
 * This file is created by Maarten Weyns.
 * 
 * Take Five online, developed by MaWey Games.
 * Play for free on takefive.ga
 * More info on games.mawey.be (site in production)
 */

// Setup variables
var gameid = localStorage.getItem("gameID");
var playerid = Number(localStorage.getItem("playerID"));

var deathPopupShown = false;

// Initialize game variables
var playerInfo;
var ownCards;

// Start the socket.io connection
socket = io(location.host);

// Initialize the MaterializeCSS components
M.AutoInit();

(function setup() {
    socket.emit("ingame-join", { gid: gameid, pid: playerid });

    socket.on("lobby", () => {
        window.location.pathname = "/";
    });

    socket.on("player-overview", (players) => {
        playerInfo = players;
    });

    socket.on("own-cards", (cards) => {
        ownCards = cards;
    });

    socket.on('row-to-be-chosen', (card) => {
        rowToBeChosen(card);
    });

    socket.on('round-states', (data) => {
        endRoundData(data);
    });

    socket.on("open-cards", (cards) => {
        drawOpenCards(cards);
    });

    socket.on("ready-self", (card) => {
        hideCards(card);
    });

    socket.on('player-ready', (pid) => {
        markPlayerReady(pid);
    });

    socket.on("finish-round", () => {
        hidePlayers();
    });

    socket.on("end-round-card", (data) => {
        showEndCard(data);
    });

    socket.on("end-round-score", (data) => {
        showNewScores(data)
    });

    socket.on("dead", () => {
        if (!deathPopupShown) {
            document.getElementById('modal-dead-trigger').click();
            deathPopupShown = true;
        }
    });

    socket.on("winner", () => {
        document.getElementById('modal-winner-trigger').click();
        confetti.start();
        setTimeout(() => {
            confetti.stop();
        }, 2000);
    });

    socket.on("disconnect", () => {
        M.toast({ html: "Disconnected!" });
    });

    socket.on('all-info', () => {
        // We recieved all initial info from the server, let's show it!
        showUsers(playerInfo);
        showOwnCards(ownCards);
    });

    
})();

function showOwnCards(cards) {
    if (cards !== undefined) {
        // Get the card container
        let container = document.getElementById("owncardscontainer");
        container.innerHTML = "";

        // Counter
        let count = 0;
        // Create a new div for all cards
        for (let card of cards) {
            let cardDiv = document.createElement("div");
            cardDiv.classList.add("ownCard");
            cardDiv.id = `card${count++}`;
            cardDiv.onclick = function () {
                selectCard(cardDiv.id);
            };
            cardDiv.setAttribute("num", card);
            let cardimg = document.createElement("img");
            cardimg.src = `../images/cards/png/${card}.png`;
            cardimg.classList.add("cardImage");
            cardDiv.append(cardimg);
            container.append(cardDiv);
        }

        console.log("Showing cards");
    }
    
}

/**
 * This function will show all users received
 * @param {array} users 
 */
function showUsers(users) {
    if (users !== undefined) {
        // Empty the data from the container
        let bigcontainer = document.getElementById('usersleft');
        bigcontainer.innerHTML = '';

        // Create empty user containers
        for (let i = 0; i < 10; i++) {
            let container = document.createElement('div');
            container.id = `user${i}`;
            container.classList.add('userslot');

            bigcontainer.append(container);
        }

        // Fill in the new data
        let count = 0;
        for (let user of users) {
            let container = document.getElementById(`user${count++}`);

            let score = document.createElement("p");
            score.innerText = user.score;
            score.classList.add("score");
            score.id = `score${count - 1}`
            if(user.penalty) {
                score.style.color = 'red';
            }

            let name = document.createElement("p");
            name.innerText = user.name;
            name.classList.add("name");

            container.append(score, name);

            if (user.alive) {
                let thinking = document.createElement('div');
                thinking.classList.add('progress');
                let pbar = document.createElement('div');
                pbar.classList.add('indeterminate', 'blue');
                thinking.append(pbar);

                container.append(thinking);
            } else {
                container.classList.add('user-dead');
            }
        }
    }
    
}

function markPlayerReady(pid) {
    let container = document.getElementById(`user${pid}`);
    container.classList.add('user-done');
}

/**
 * This function will show scores from a given scoring array
 * @param {array} data The scores array to show
 */
function showNewScores(data) {
    for (let score of data) {
        let scoreElement = document.getElementById(`score${score.pid}`);
        decrementScore(scoreElement, score.score);
        scoreElement.style.color = 'black';
    }
}

function selectCard(cardID) {
    if (
        document.getElementsByClassName("selected")[0] !== undefined &&
        document.getElementsByClassName("selected")[0].id === cardID
    ) {
        document.getElementById(cardID).classList.remove("selected");
        document.getElementById(cardID).removeChild(document.getElementById("confirmbutton"));
        return;
    }

    let cards = document.getElementsByClassName("ownCard");
    for (let card of cards) {
        card.classList.remove("selected");
        if (card.children.length > 1) {
            card.removeChild(document.getElementById("confirmbutton"));
        }
    }

    document.getElementById(cardID).classList.add("selected");

    if (document.getElementById("confirmbutton") === null) {
        let container = document.getElementById(cardID);
        let confirm = document.createElement("a");
        confirm.id = "confirmbutton";
        confirm.classList.add("waves-effect", "waves-light", "btn-floating", "blue", "pulse");
        confirm.innerHTML = '<i class="material-icons left">check</i>';
        confirm.onclick = function () {
            confirmSelection();
        };
        container.append(confirm);
    }
}

function confirmSelection() {
    if (document.getElementsByClassName("selected").length === 0) {
        M.toast({ html: "Select a card first!" });
        return;
    }

    let card = Number(document.getElementsByClassName("selected")[0].getAttribute("num"));
    socket.emit("confirm-selection", { pid: playerid, card: card });
}

/**
 * This function will draw an array of cards on the screen
 * @param {array} data The received data of the cards to draw
 */
function drawOpenCards(data) {
    console.log('Last changed card is: ' + data.last);
    let cardslots = document.getElementsByClassName('cardslot');
    for (let cardslot of cardslots) {
        cardslot.style.backgroundImage = '';
    }
    let cards = data.cards;
    let lastChanged = data.last;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < cards[i].length; j++) {
            let container = document.getElementById(`card${i + 1}${j + 1}`);
            container.setAttribute("num", cards[i][j]);
            if (cards[i][j] === lastChanged) {
                container.classList.add('popcard');
                setTimeout(() => {
                    container.classList.remove('popcard');
                }, 500)
            }
            container.style.backgroundImage = `url(../images/cards/png/${cards[i][j]}.png)`;
            container.onclick = function () {chooseRow(i)};
        }
    }
}

function chooseRow(row) {
    if (0 <= row <= 4) {
        socket.emit("confirm-row-choice", {pid: playerid, row: row});
    }
}

/**
 * This function hides all cards except the one the user selected.
 * @param {Number} num The card not to hide
 */
function hideCards(num) {
    let cards = document.getElementsByClassName("ownCard");
    for (let card of cards) {
        if (Number(card.getAttribute('num')) !== num) {
            card.style.opacity = 0;
            setTimeout(function () {
                card.style.display = "none";
            }, 100);
        } else {
            card.style.pointerEvents = "none";
        }
    }
}

/**
 * This function will hide all players
 */
function hidePlayers() {
    let players = document.getElementsByClassName("userslot");
    for (let player of players) {
        player.style.opacity = 0;
        setTimeout(function () {
            player.style.display = "none";
        }, 100);
    }
}

/**
 * This function will show all players again
 */
function showPlayers() {
    let players = document.getElementsByClassName("userslot");
    for (let player of players) {
        player.style.display = "flex";
        player.style.opacity = 100;
    }
}

function showEndCard(data) {
    if (data.row === -1 && data.pid === playerid) {
        M.toast({html: "Choose a row by clicking on its first card!"});
    };
    let container = document.getElementById("usersleft");
    container.innerHTML = "";

    let userslot = document.createElement("div");
    userslot.classList.add("userslot", "user-card-slot");
    let username = document.createElement("p");
    username.innerText = data.name;
    username.classList.add("cardname");
    userslot.append(username);

    let card = document.createElement("img");
    card.src = `../images/cards/png/${data.card}.png`;
    card.classList.add("cardimage");
    card.classList.add("flip-in-hor-top");

    container.append(card, userslot);
}

function showEndCardNew(number, name) {
    let container = document.getElementById("usersleft");
    container.innerHTML = "";

    let userslot = document.createElement("div");
    userslot.classList.add("userslot", "user-card-slot");
    let username = document.createElement("p");
    username.innerText = name;
    username.classList.add("cardname");
    userslot.append(username);

    let card = document.createElement("img");
    card.src = `../images/cards/png/${number}.png`;
    card.classList.add("cardimage");
    card.classList.add("flip-in-hor-top");

    container.append(card, userslot);
}

function rowToBeChosen(card) {
    let pid = card.pid;
    let num = card.num;
    let name = card.name;
    showEndCardNew(num, name);
    if (pid === playerid) {
        M.toast({html: "Choose a row by clicking on its first card!"});
    }
}

/**
 * This function will show the user the ending data of the currently played round.
 * @param {array} data The data to be processed by the client
 */
function endRoundData(data) {
    // Get all states from the array
    for (let i = 0; i < data.length; i++) {
        let state = data[i];
        let card = state.cardNum;
        let name = state.cardPlayer;
        let openCards = state.openCardsState;
        
        setTimeout(() => {
            showEndCardNew(card, name);
            setTimeout(() => {
                drawOpenCards(openCards);
                if (i === data.length - 1) {
                    setTimeout(() => {
                        showUsers(playerInfo);
                        showOwnCards(ownCards);
                    }, 1000* (i + 1));
                }
            }, 1000 * (i + 1));
        }, 1000 * i);
    }
}

/**
 * This function will update a user's score on screen.
 * @param {*} scoreElem The score element of the user
 * @param {*} newScore The new score to show
 */
function decrementScore(scoreElem, newScore) {
    let difference = Number(scoreElem.innerText) - newScore;
    let i = 0;
    while (i < difference) {
        setTimeout(function() {
            scoreElem.innerText = Number(scoreElem.innerText) - 1;
        }, 10 * i);
        i++;
    }
}