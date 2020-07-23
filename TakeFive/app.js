var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var http = require('http');

var app = express();

const Game = require('./game');
const player = require('./player');

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
});

console.info('Starting serever on port ' + process.argv[2]);
server.listen(process.argv[2]);
console.info('[SERVERSTART] Server started!');

module.exports = app;