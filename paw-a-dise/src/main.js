import AudioManager from './audio/audio-manager.js';
import { ART, GAME_TITLE } from './config/assets.js';
import { createGame } from './game/app.js';

const bootOverlay = document.getElementById('boot-overlay');
const startButton = document.getElementById('start-game');
const bootStatus = document.getElementById('boot-status');
const bootImage = document.getElementById('boot-image');
const gameRoot = document.getElementById('game-root');

bootImage.src = ART.loadingAurora;
bootImage.alt = `${GAME_TITLE} Aurora loading art`;
document.title = GAME_TITLE;

const audioManager = new AudioManager();
let gameInstance = null;

async function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });
}

async function boot() {
  try {
    bootStatus.textContent = 'Loading Aurora, village skies, and glowing eggs…';
    await Promise.all([
      preloadImage(ART.loadingAurora),
      preloadImage(ART.villageMeadow),
      preloadImage(ART.levelMap),
      preloadImage(ART.shopBackground),
      preloadImage(ART.collectionBackground),
      preloadImage(ART.profileBackground),
      preloadImage(ART.settingsBackground),
    ]);
    bootStatus.textContent = 'Everything is ready. Tap to hatch your meadow.';
  } catch (error) {
    console.error('Boot preload failed', error);
    bootStatus.textContent = 'A few scenic assets were slow, but Paw-a-dise is ready to start.';
  }
  startButton.hidden = false;
}

startButton.addEventListener('click', async () => {
  startButton.hidden = true;
  bootStatus.textContent = 'Opening the meadow…';
  audioManager.init();
  try { await audioManager._unlock?.(); } catch (e) { console.warn('Audio unlock failed', e); }
  bootOverlay.style.display = 'none';
  gameRoot.hidden = false;
  gameInstance = createGame(gameRoot, audioManager);
});

window.addEventListener('beforeunload', () => { gameInstance?.destroy(); });

boot();
