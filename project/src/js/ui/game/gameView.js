var session = require('../../session');
var roundView = require('../round/view/roundView');
var gamesMenu = require('../gamesMenu');
var loginModal = require('../loginModal');
var layout = require('../layout');
var menu = require('../menu');
var settings = require('../../settings');
var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var i18n = require('../../i18n');

function joinOverlay(ctrl) {
  if (!ctrl.isJoinable()) return;

  var data = ctrl.getData();
  var opp = data.opponent.user;
  var mode = data.game.rated ? i18n('rated') : i18n('casual');
  var joinDom;
  if (data.game.rated && !session.isConnected()) {
    joinDom = m('div.error', [
      i18n('thisGameIsRated'), m('br'), m('br'), i18n('mustSignInToJoin'),
      m('div.go_or_cancel', [
        m('button.binany_choice[data-icon=E]', {
          config: helper.ontouchend(loginModal.open)
        }, i18n('signIn')),
        m('button.binany_choice[data-icon=L]', {
          config: helper.ontouchend(utils.backHistory)
        }, i18n('cancel'))
      ])
    ]);
  } else {
    joinDom = m('div.go_or_cancel', [
      m('button.binany_choice[data-icon=E]', {
          config: helper.ontouchend(utils.f(ctrl.joinUrlChallenge, data.game.id))
      }, i18n('join')),
      m('button.binany_choice[data-icon=L]', {
        config: helper.ontouchend(utils.backHistory)
      }, i18n('cancel'))
    ]);
  }

  return function() {
    return widgets.overlayPopup(
      'join_url_challenge',
      opp ? opp.username : 'Anonymous',
      m('div.infos', [
        m('p.explanation', data.game.variant.name + ', ' + mode),
        m('p.time[data-icon=p]', utils.gameTime(data)),
        m('br'),
        joinDom
      ]),
      true
    );
  };
}

module.exports = function(ctrl) {
  if (ctrl.getRound()) return roundView(ctrl.getRound());

  var theme = settings.general.theme;
  var pov = gamesMenu.lastJoined;
  var header, board;

  if (pov) {
    header = widgets.connectingHeader;
    board = utils.partialf(widgets.boardArgs, pov.fen, pov.lastMove, pov.color,
      pov.variant.key, theme.board(), theme.piece());
  } else {
    header = utils.partialf(widgets.header, 'lichess.org');
    board = widgets.board;
  }

  var overlay = joinOverlay(ctrl);

  return layout.board(header, board, widgets.empty, menu.view, overlay,
    pov ? pov.color : null);
};
