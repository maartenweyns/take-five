// Setup variables
var gameid = localStorage.getItem("gameID");
var playerid = Number(localStorage.getItem("playerID"));

socket = io(location.host);

(function setup() {
    socket.emit("ingame-join", { gid: gameid, pid: playerid });

    socket.on("lobby", () => {
        window.location.pathname = "/";
    });

    socket.on("player-overview", (players) => {
        showUsers(players);
    });

    socket.on("own-cards", (cards) => {
        showOwnCards(cards);
    });

    socket.on("open-cards", (cards) => {
        drawOpenCards(cards);
    });

    socket.on("ready-self", (card) => {
        hideCards(card);
    });

    socket.on("finish-round", () => {
        hidePlayers();
    });

    socket.on("end-round-card", (data) => {
        showEndCard(data);
    });

    socket.on("end-round-score", (data) => {
        M.toast({ html: "Scoring!" });
        showNewScores(data)
    });

    socket.on("disconnect", () => {
        M.toast({ html: "Disconnected!" });
    });
})();

function showOwnCards(cards) {
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

/**
 * This function will show all users received
 * @param {array} users 
 */
function showUsers(users) {
    // Empty the data from the container
    let bigcontainer = document.getElementById('usersleft');
    bigcontainer.innerHTML = '';

    // let allUserContainers = document.getElementsByClassName("userslot");
    // for (let container of allUserContainers) {
    //     container.innerHTML = "";
    // }

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
        console.log(`Showing user ${user.name} with penalty: ${user.penalty}`);

        let container = document.getElementById(`user${count++}`);

        let score = document.createElement("p");
        score.innerText = user.score;
        score.classList.add("score");
        if(user.penalty) {
            score.style.color = 'red';
        }

        let name = document.createElement("p");
        name.innerText = user.name;
        name.classList.add("name");

        container.append(score, name);
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
        confirm.classList.add("waves-effect", "waves-light", "btn-floating", "blue");
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
                container.style.animation = 'popcard 500ms ease';
            }
            container.style.backgroundImage = `url(../images/cards/png/${cards[i][j]}.png)`;
            container.onclick = function () {chooseRow(i)};
        }
    }
}

function chooseRow(row) {
    console.log(`Choosing row ${row}`);
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
    userslot.classList.add("userslot");
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