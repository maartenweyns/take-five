// Setup variables
var gameid = localStorage.getItem("gameID");
var playerid = localStorage.getItem("playerID");

(function setup() {
    socket = io(location.host);

    socket.emit("ingame-join", { gid: gameid, pid: playerid });

    socket.on("lobby", () => {
        window.location.pathname = "/";
    });

    socket.on("player-overview", (players) => {
        showUsers(players)
    });

    socket.on("own-cards", (cards) => {
        showOwnCards(cards);
    });

    socket.on("first-col-cards", (cards) => {
        drawFirstColumnCards(cards);
    });
})();

function showOwnCards(cards) {
    // Get the card container
    let container = document.getElementById("owncardscontainer");

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
        let cardimg = document.createElement("img");
        cardimg.src = `../images/cards/png/${card}.png`;
        cardimg.classList.add("cardImage");
        cardDiv.append(cardimg);
        container.append(cardDiv);
    }

    console.log("Showing cards");
}

function showUsers(users) {
    // Empty the data from the containers
    let allUserContainers = document.getElementsByClassName('userslot');
    for(let container of allUserContainers) {
        container.innerHTML = '';
    }

    // Fill in the new data
    let count = 0;
    for (let user of users) {
        console.log('Showing user ' + user.name);

        let container = document.getElementById(`user${count}`);

        let score = document.createElement('p');
        score.innerText = user.score;
        score.classList.add('score');

        let name = document.createElement('p');
        name.innerText = user.name;
        name.classList.add('name');

        container.append(score, name);
    }
}

function selectCard(cardID) {
    if (
        document.getElementsByClassName("selected")[0] !== undefined &&
        document.getElementsByClassName("selected")[0].id === cardID
    ) {
        document.getElementById(cardID).classList.remove("selected");
        return;
    }

    let cards = document.getElementsByClassName("ownCard");
    for (let card of cards) {
        card.classList.remove("selected");
    }

    document.getElementById(cardID).classList.add("selected");
}

function drawFirstColumnCards(cards) {
    if (cards.length !== 4) {
        alert('Something went wrong');
    }
    for(let i = 0; i < 4; i++) {
        let container = document.getElementById(`card${i+1}1`);
        container.style.backgroundImage = `url(../images/cards/png/${cards[i]}.png)`;
    }
}
