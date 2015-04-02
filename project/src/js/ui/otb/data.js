var Chess = require('chessli.js').Chess;
var opposite = require('chessground').util.opposite;

module.exports = function(cfg) {

  cfg = cfg || {};
  cfg.color = cfg.color || 'white';
  cfg.fen = cfg.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  var chess = new Chess(cfg.fen);

  return {
    "game": {
      "id": "__OTB___",
      "variant": {
        "key": "standard",
        "name": "Standard",
        "short": "STD",
        "title": "Standard rules of chess (FIDE)"
      },
      "initialFen": cfg.fen,
      "fen": cfg.fen,
      "player": chess.turn() === 'w' ? 'white' : 'black',
      "status": {
        "id": 20,
        "name": "started"
      },
      "startedAtTurn": 0,
      "turns:": 0
    },
    "player": {
      "color": cfg.color
    },
    "opponent": {
      "color": opposite(cfg.color)
    },
    "pref": {
      "highlight": true,
      "destination": true
    },
    "clock": {
      "running": false,
      "initial": 300,
      "increment": 8,
      "black": 300,
      "white": 300,
      "emerg": 30
    }
  };
};
