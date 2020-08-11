var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var http = require("http");

var app = express();

const Game = require("./game");
const game = require("./game");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

var server = http.createServer(app);
const io = require("socket.io")(server);

let games = new Map();

function getUnusedGameCode() {
    let gid = `TF${Math.floor(Math.random() * 10000)}`;
    if (games.has(gid)) {
        return getUnusedGameCode();
    } else {
        return gid;
    }
}

io.on("connection", (socket) => {
    socket.on("create-game", () => {
        let gameid = getUnusedGameCode();
        games.set(gameid, new Game(gameid));
        console.log(`[CREATEGAME] Game with id ${gameid} created!`);
        socket.emit("join", gameid);
    });

    socket.on("player-name", (data) => {
        let name = data.name;
        let gid = data.gid;
        let sid = socket.id;

        let game = games.get(gid);

        if (game === undefined) {
            socket.emit("invalid-game");
            return;
        }
        if (game.state !== "lobby") {
            socket.emit("game-started");
            return;
        }
        let result = game.addPlayer(name, sid);

        if (result === false) {
            socket.emit("game-full");
            return;
        } else {
            socket.emit("information", { playerID: result.id, gameID: gid });
            socket.join(gid);
            io.in(gid).emit("player-overview", game.getPlayerInformation());
        }
    });

    socket.on("start-game", (gid) => {
        let game = games.get(gid);
        if (game === undefined) {
            socket.emit("invalid-game");
            return;
        }

        if (game.state === "lobby") {
            game.startGame();
            io.in(gid).emit("game");
            return;
        } else {
            socket.emit("game-started");
            return;
        }
    });

    socket.on("ingame-join", (data) => {
        let gid = data.gid;
        let pid = data.pid;

        // Get the game associated with the gameid
        let game = games.get(gid);

        // Check if the game exists
        if (game === undefined) {
            socket.emit("lobby");
            return;
        }

        // Join the socket in the game room
        socket.join(gid);
        // Update the player's socketid
        game.player(pid).updateSocketID(socket.id);

        let gamestatus = game.getStatus();

        if (gamestatus === "ongoing") {
            // Send the player information
            socket.emit("player-overview", game.getPlayerInformation());
            // Send the player's cards
            socket.emit("own-cards", game.player(pid).getCards());
            // Send the open cards
            socket.emit("open-cards", game.getOpenCards());
        }
    });

    socket.on("confirm-selection", (data) => {
        let game = games.get(Object.keys(socket.rooms)[1]);

        if (game === undefined) {
            socket.emit("lobby");
            return;
        }

        let pid = data.pid;
        let card = data.card;

        game.player(pid).setSelectedCard(card);
        socket.emit("ready-self", card);
        io.in(game.getID()).emit('player-ready', pid);

        if (game.allPlayersReady()) {
            game.finishRound();
            io.in(game.getID()).emit("finish-round");

            setTimeout(function () {
                allPlayersChose(game);
            }, 1000);
        }
    });

    socket.on("confirm-row-choice", (data) => {
        console.log(`Player chose row ${data.row}`);
        let game = games.get(Object.keys(socket.rooms)[1]);

        if (game === undefined) {
            socket.emit("lobby");
            return;
        }

        let pid = data.pid;
        let row = data.row;
        if (pid !== game.getChoosingRow()) {
            console.log(`This player should not be choosing a row, but ${game.getChoosingRow()} should`);
            return;
        }
        if (row !== undefined) {
            game.setChoosingRow(-1);
            game.playerTookRow(pid, row, game.selectedCards.pop().num);
            io.in(game.getID()).emit("open-cards", game.getOpenCards());
            allPlayersChose(game);
        }
    });
});

/**
 * This function takes the first card from the selected array or sends a message when it's empty
 * @param {object} io The socket.io instance to communicate over
 * @param {object} game The game of which we are ending a round
 */
function allPlayersChose(game) {
    if (game.getSelectedCards().length === 0) {
        // Go to the next round if necessary.
        if (game.getCardInRound() >= 10) {
            game.nextRound();
            io.in(game.getID()).emit("open-cards", game.getOpenCards(), 0);
            io.in(game.getID()).emit("end-round-score", game.getScores());
            let dead = game.getDeadPlayers();
            for (let player of dead) {
                io.to(player.getSocketID()).emit("dead");
            }
        } else {
            game.nextCard();
        }
        // Send the player information
        io.in(game.getID()).emit("player-overview", game.getPlayerInformation());
        // Set all players to not ready
        game.setAllPlayersReady(false);
        // Send the cards to each player
        let players = game.getPlayers();
        for (let player of players) {
            io.to(player.getSocketID()).emit("own-cards", game.player(player.getID()).getCards());
        }
        return;
    }
    let selection = game.selectedCards.pop();

    if (selection.num < game.getSmallestCard()) {
        // The card requires the player to choose a row.
        game.setChoosingRow(selection.pid);
        sendPlayerCard(io.in(game.getID()), selection, -1);

        // Push the card to the stack so that we can replace the row with this card
        game.selectedCards.push(selection);

        return;
    } else {
        let row = game.placeCardOnRow(selection.num, selection.pid);
        sendPlayerCard(io.in(game.getID()), selection);
        setTimeout(function () {
            io.in(game.getID()).emit("open-cards", game.getOpenCards(), 0);
            allPlayersChose(game);
        }, 2000);
    }
}

/**
 * This function sends a card to all players
 * @param {string} room The socket.io room to send emit to
 * @param {object} selection The card that was selected
 */
function sendPlayerCard(room, selection, row) {
    room.emit("end-round-card", {
        pid: selection.pid,
        card: selection.num,
        name: selection.name,
        row: row
    });
}

console.info("Starting serever on port " + process.argv[2]);
server.listen(process.argv[2]);
console.info("[SERVERSTART] Server started!");

module.exports = app;