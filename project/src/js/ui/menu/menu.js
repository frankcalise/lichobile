var utils = require('../../utils');
var Zanimo = require('zanimo');
var backbutton = require('../../backbutton');
var Hammer = require('hammerjs');

var dragThreshold = 10;
var edgeThreshold = 5;

var mc;
var menu = {};

document.addEventListener('DOMContentLoaded', function() {
  mc = new Hammer.Manager(document.body.querySelector('.view-container'), {
      recognizers: [
          [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }],
          [Hammer.Swipe,{ direction: Hammer.DIRECTION_HORIZONTAL }],
      ]
  });
  mc.on('panright panleft swipe', handleDrag);
});

function handleDrag(e) {
  var touch = e.changedPointers[0];
  if (e.type === 'panright' && e.isFirst && touch.clientX <= edgeThreshold)
    menu.isDragging = true;
  if (!menu.isDragging)
    return;
  else {
    // TODO
  }
}

/* public properties */
menu.isOpen = false;
menu.settingsOpen = false;
menu.isDragging = false;

/* public methods */

menu.width = function() {
  var vw = utils.getViewportDims().vw;
  return vw * (85 / 100);
};

menu.openSettings = function() {
  window.analytics.trackView('Settings');
  backbutton.stack.push(menu.closeSettings);
  menu.settingsOpen = true;
};

menu.closeSettings = function(fromBB) {
  if (fromBB !== 'backbutton' && menu.settingsOpen) backbutton.stack.pop();
  menu.settingsOpen = false;
};

// we need to transition manually the menu on route change, because mithril's
// diff strategy is 'all'
menu.menuRouteAction = function(route) {
  return function() {
    menu.close();
    return Zanimo(document.getElementById('side_menu'), 'transform', 'translate3d(-100%,0,0)',
      '250', 'ease-out').then(utils.ƒ(m.route, route));
  };
};

menu.toggle = function() {
  if (menu.isOpen) menu.close();
  else menu.open();
};

menu.open = function() {
  window.analytics.trackView('Main Menu');
  backbutton.stack.push(menu.close);
  menu.isOpen = true;
};

menu.close = function(fromBB) {
  if (menu.settingsOpen) menu.closeSettings();
  if (fromBB !== 'backbutton' && menu.isOpen) backbutton.stack.pop();
  menu.isOpen = false;
};

module.exports = menu;
