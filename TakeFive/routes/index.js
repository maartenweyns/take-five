var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile("lobby.html", {root: "./public"})
});

router.get('/play', function(req, res, next) {
  res.sendFile("game.html", {root: "./public"})
});

router.get('/score', function(req, res, next) {
  res.sendFile("score.html", {root: "./public"})
});

router.get('/rules', function(req, res, next) {
  res.sendFile("rules.html", {root: "./public"})
});

// router.get('/profile', requiresAuth(), (req, res) => {
//   res.send(JSON.stringify(req.openid.user));
// });

module.exports = router;