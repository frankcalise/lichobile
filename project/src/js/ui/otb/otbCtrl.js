var promotion = require('./promotion');
var ground = require('./ground');
var makeData = require('./data');
var sound = require('../../sound');
var replayCtrl = require('./replay/replayCtrl');
var storage = require('../../storage');
var actions = require('./actions');
var helper = require('../helper');
var clockCtrl = require('./clock/clockCtrl');
var gameStatus = require('../round/status');
var game = require('../round/game');

module.exports = function(cfg) {

  helper.analyticsTrackView('On The Board');

  var storageKey = 'otb.current';
  var clockIntervId;

  var addMove = function(orig, dest, promotionRole) {
    this.replay.addMove(orig, dest, promotionRole);
    
    // increment turns
    var turns = this.data.game.turns;
    turns ? turns++ : turns = 1;
    this.data.game.turns = turns;
    if (turns > 2) this.data.clock.running = true;

    // switch current player in game data
    this.data.game.player = this.data.game.player === 'white' ?  'black' : 'white';

    save();
    m.redraw();
    if (this.replay.situation().checkmate) setTimeout(function() {
      this.actions.open();
      m.redraw();
    }.bind(this), 1000);
  }.bind(this);

  var onPromotion = function(orig, dest, role) {
    addMove(orig, dest, role);
  }.bind(this);

  var userMove = function(orig, dest) {
    if (!promotion.start(this, orig, dest, onPromotion)) {
      addMove(orig, dest);
    }
  }.bind(this);

  var onCapture = function() {
    sound.capture();
  }.bind(this);

  var onMove = function() {
    sound.move();
  };

  this.init = function(data, situations, ply) {
    this.data = data || makeData(cfg);
    if (!this.chessground)
      this.chessground = ground.make(this.data, this.data.game.fen, userMove, onMove, onCapture);
    else ground.reload(this.chessground, this.data, this.data.game.fen);
    if (!this.replay) this.replay = new replayCtrl(this, situations, ply);
    else this.replay.init(situations, ply);
    this.replay.apply();
    if (this.actions) this.actions.close();
    else this.actions = new actions.controller(this);

    // clock
    if (!this.clock)
      this.clock = this.data.clock ? new clockCtrl(this.data.clock, function() {
          this.data.game.status.id = gameStatus.ids.outoftime;
          // stop clock timer if enabled
          clearInterval(clockIntervId);
        }, this.data.player.color
      ) : false;

    if (this.clock) clockIntervId = setInterval(this.clockTick, 100);

  }.bind(this);

  this.initAs = function(color) {
    this.init(makeData({
      color: color
    }));
  }.bind(this);

  this.isClockRunning = function() {
    return this.data.clock && game.playable(this.data) &&
      ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.clock.running);
  }.bind(this);

  this.clockTick = function() {
    if (this.isClockRunning()) this.clock.tick(this.data.game.player);
  }.bind(this);

  var saved = storage.get(storageKey);
  if (saved) this.init(saved.data, saved.situations, saved.ply);
  else this.init();

  var save = function() {
    storage.set(storageKey, {
      data: this.data,
      situations: this.replay.situations,
      ply: this.replay.ply
    });
  }.bind(this);

  window.plugins.insomnia.keepAwake();

  this.onunload = function() {
    if (clockIntervId) clearInterval(clockIntervId);
    window.plugins.insomnia.allowSleepAgain();
  };
};
