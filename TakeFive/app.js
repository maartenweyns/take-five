var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var http = require('http');

var app = express();

const Game = require('./game');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

var server = http.createServer(app);
const io = require('socket.io')(server);

let games = new Map();

function getUnusedGameCode() {
    let gid = `TF${Math.floor(Math.random() * 10000)}`;
    if (games.has(gid)) {
        return getUnusedGameCode();
    } else {
        return gid;
    }
}

io.on('connection', (socket) => {
    socket.on('create-game', () => {
        let gameid = getUnusedGameCode();
        games.set(gameid, new Game(gameid));
        console.log(`[CREATEGAME] Game with id ${gameid} created!`);
        socket.emit('join', gameid);
    });
    
    socket.on('player-name', (data) => {
        let name = data.name;
        let gid = data.gid;

        let game = games.get(gid);

        if (game === undefined) {
            socket.emit('invalid-game');
            return;
        }
        if (game.state !== 'lobby') {
            socket.emit('game-started');
            return;
        }
        let result = game.addPlayer(name);

        if (result === false) {
            socket.emit('game-full');
            return;
        } else {
            socket.emit('information', {playerID: result.id, gameID: gid});
            socket.join(gid);
            io.in(gid).emit('player-overview', game.getPlayerInformation());
        }
    });

    socket.on('start-game', (gid) => {
        let game = games.get(gid);
        if (game === undefined) {
            socket.emit('invalid-game');
            return;
        }

        if (game.state === 'lobby') {
            game.startGame();
            io.in(gid).emit('game');
            return;
        } else {
            socket.emit('game-started');
            return;
        }
    });

    socket.on('ingame-join', (data) => {
        let gid = data.gid;
        let pid = data.pid;

        // Get the game associated with the gameid
        let game = games.get(gid);

        // Check if the game exists
        if (game === undefined) {
            socket.emit('lobby');
            return;
        }

        // Join the socket in the game room
        socket.join(gid);

        let gamestatus = game.getStatus();
        
        if (gamestatus === 'ongoing') {
            socket.emit('own-cards', game.player(pid).getCards());
        }
    });
});

console.info('Starting serever on port ' + process.argv[2]);
server.listen(process.argv[2]);
console.info('[SERVERSTART] Server started!');

module.exports = app;