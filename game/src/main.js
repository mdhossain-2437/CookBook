import { Game } from './Game.js';

const params = new URLSearchParams(location.search);
const game = new Game(document.getElementById('game'), {
  autostart: params.has('autostart'),
  time: params.get('time'),
});
window.__game = game;
game.start();
