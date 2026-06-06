import AudioManager from './audio/audio-manager.js';
import {
  ANIMALS, ART, AUDIO, BUILDINGS, COLLECTION_ORDER, EGG_TYPES,
  GAME_TITLE, NAV_ITEMS, POWER_UPS, SKINS, WORLD,
} from '../config/assets.js';
import { getLevelByNumber, levels } from '../config/levels.js';
import {
  addCurrencies, addFragments, addInventory, allRaresFound,
  buildVillageStructure, consumeInventory, countFoundAnimals,
  countVillageAnimals, getLevelResult, getVillageWeather, loadSave,
  markAuroraFragmentLevel, persistSave, recordLevelOutcome, renamePlayer,
  selectSkin, setAnimalVillageState, unlockAnimal, unlockMateriaSkin,
  updateSettings, visitVillage,
} from '../state/storage.js';
import {
  BOARD_COLUMNS, BOARD_ROWS, applyBlast, cloneBoard, countObstacleCells,
  createPositionMap, generateBoard, getAllCells, getAreaCells, getCluster,
  getColorCells, getCrossCells, getRowCells, growVines, hasValidMove, shuffleBoard,
} from './board.js';
import { createBackground } from './background.js';
import { createParticleSystem } from './particles.js';

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function pluralize(value, label) { return `${value} ${label}${value === 1 ? '' : 's'}`; }
function starsForResult(level, score, movesLeft) {
  const ratio = score / level.targetScore;
  if (ratio >= 1.25 || movesLeft >= Math.max(4, Math.floor(level.moves * 0.28))) return 3;
  if (ratio >= 1.05 || movesLeft >= 2) return 2;
  if (ratio >= 1) return 1;
  return 0;
}
function randomItem(items) { return items[Math.floor(Math.random() * items.length)]; }
function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function getEggImage(eggKey, skinKey) { const egg = EGG_TYPES[eggKey]; return skinKey === SKINS.materia.key ? egg.materiaUrl : egg.jewelUrl; }
function buildStarterVillage(save) { return save.village?.buildingsOwned?.length ? save.village.buildingsOwned : ['clover_burrow']; }

// ─── Per-animal animation config ────────────────────────────────────────────
const ANIMAL_ANIM = {
  clover:  { cls: 'anim-clover',  isRare: false },
  bramble: { cls: 'anim-bramble', isRare: false },
  pippin:  { cls: 'anim-pippin',  isRare: false },
  fern:    { cls: 'anim-fern',    isRare: false },
  thistle: { cls: 'anim-thistle', isRare: true  },
  cobble:  { cls: 'anim-cobble',  isRare: true  },
  shimmer: { cls: 'anim-shimmer', isRare: true  },
  soleil:  { cls: 'anim-soleil',  isRare: true  },
  mist:    { cls: 'anim-mist',    isRare: true  },
  aurora:  { cls: 'anim-aurora',  isRare: true  },
};

// ─── Power-up visual effects ────────────────────────────────────────────────
const POWER_FX = {
  pawSwipe:     { icon: '🐾', color: '#ffd68b', label: 'Paw Swipe!' },
  vineBurst:    { icon: '🌿', color: '#7eff9a', label: 'Vine Burst!' },
  rainbowEgg:   { icon: '🌈', color: '#ff9ef5', label: 'Rainbow Egg!' },
  nestSpin:     { icon: '🍃', color: '#a8ffce', label: 'Nest Spin!' },
  dewdropFreeze:{ icon: '❄️', color: '#a4d8ff', label: 'Freeze!' },
  grandHatch:   { icon: '⭐', color: '#ffe07a', label: 'Grand Hatch!' },
};

export function createGame(root, audioManager) {
  root.innerHTML = `
    <canvas id="bg-canvas"></canvas>
    <div class="paw-app">
      <div class="screen screen--loading active" data-screen="loading">
        <div class="loading-hero" style="background-image:url('${ART.loadingAurora}')">
          <div class="loading-hero__veil"></div>
          <div class="loading-card">
            <div class="loading-card__kicker">Celestial reveal</div>
            <h1>${GAME_TITLE}</h1>
            <p>Warm eggs. Meadow homes. Tiny guardians waiting for you.</p>
            <button class="primary-btn" data-action="enter-village">Enter Paw-a-dise</button>
          </div>
        </div>
      </div>

      <div class="screen" data-screen="village">
        <div class="screen-backdrop" style="background-image:url('${ART.villageMeadow}')"></div>
        <div class="top-bar">
          <div class="top-bar__brand">
            <span class="top-bar__title">${GAME_TITLE}</span>
            <small data-bind="weather-label"></small>
          </div>
          <div class="currency-strip">
            <div class="currency-pill">🐾 <strong data-bind="paws-balance"></strong></div>
            <div class="currency-pill">🌰 <strong data-bind="acorns-balance"></strong></div>
          </div>
        </div>
        <div class="village-view">
          <div class="village-stage">
            <div class="village-stage__lighting"></div>
            <div class="village-stage__buildings" data-bind="village-buildings"></div>
            <div class="village-stage__animals" data-bind="village-animals"></div>
          </div>
          <div class="village-sidecard glass-panel">
            <div class="panel-heading">
              <div>
                <small>Village world</small>
                <h2>${WORLD.name}</h2>
              </div>
              <button class="icon-btn" data-action="open-settings">⚙</button>
            </div>
            <div class="metric-grid">
              <div class="metric-card"><span>Animals</span><strong data-bind="found-animals-count"></strong></div>
              <div class="metric-card"><span>Village</span><strong data-bind="village-animal-count"></strong></div>
              <div class="metric-card"><span>Visits</span><strong data-bind="village-visits"></strong></div>
            </div>
            <div class="village-progress">
              <div class="panel-heading panel-heading--compact">
                <span>Aurora Gate</span>
                <strong data-bind="aurora-progress"></strong>
              </div>
              <div class="progress-track"><span data-bind="aurora-progress-bar"></span></div>
              <p data-bind="village-message"></p>
            </div>
            <div class="button-stack">
              <button class="primary-btn" data-action="visit-bonus">Collect Visit Bonus</button>
              <button class="secondary-btn" data-action="open-level-select">Play Puzzle</button>
            </div>
            <div class="build-tray">
              <div class="panel-heading panel-heading--compact">
                <span>Build with Paws</span>
                <strong data-bind="build-count"></strong>
              </div>
              <div class="build-grid" data-bind="village-build-shop"></div>
            </div>
          </div>
        </div>
        <nav class="bottom-nav" data-bind="bottom-nav"></nav>
      </div>

      <div class="screen" data-screen="levels">
        <div class="screen-backdrop screen-backdrop--map" style="background-image:url('${ART.levelMap}')"></div>
        <div class="map-shell glass-panel">
          <div class="panel-heading">
            <button class="icon-btn" data-action="back-to-village">←</button>
            <div><small>World 1</small><h2>${WORLD.name}</h2></div>
            <button class="pill-btn" data-action="toggle-skin" data-bind="skin-toggle-label"></button>
          </div>
          <div class="map-scroll" data-bind="level-map"></div>
        </div>
      </div>

      <div class="screen" data-screen="puzzle">
        <div class="screen-backdrop screen-backdrop--puzzle" style="background-image:url('${ART.villageMeadow}')"></div>
        <div class="puzzle-shell">
          <div class="puzzle-top">
            <button class="icon-btn" data-action="leave-puzzle">←</button>
            <div class="hud-pill"><span>Score</span><strong data-bind="score"></strong></div>
            <div class="hud-pill hud-pill--target">
              <span>Target</span><strong data-bind="target"></strong>
              <div class="progress-track progress-track--tiny"><span data-bind="target-progress"></span></div>
            </div>
            <div class="hud-pill"><span>Moves</span><strong data-bind="moves-left"></strong></div>
          </div>
          <div class="puzzle-meta">
            <div class="meta-chip" data-bind="level-name"></div>
            <div class="meta-chip" data-bind="objective-summary"></div>
            <div class="meta-chip meta-chip--alert" data-bind="vine-timer"></div>
          </div>
          <div class="board-shell glass-panel">
            <div class="combo-banner" data-bind="combo-banner">Dream Combo x1</div>
            <div class="board" data-bind="board"></div>
          </div>
          <div class="power-bar" data-bind="power-bar"></div>
        </div>
        <div class="power-fx-overlay" data-bind="power-fx-overlay"></div>
      </div>

      <div class="screen modal-screen" data-screen="level-complete">
        <div class="modal-card modal-card--celebration">
          <small>Level Complete</small>
          <h2 data-bind="complete-title"></h2>
          <div class="stars" data-bind="complete-stars"></div>
          <p data-bind="complete-summary"></p>
          <div class="reward-grid" data-bind="complete-rewards"></div>
          <div class="reveal-panel" data-bind="reveal-panel"></div>
          <div class="button-stack">
            <button class="primary-btn" data-action="next-level">Next Level</button>
            <button class="secondary-btn" data-action="return-to-village">Return to Village</button>
          </div>
        </div>
      </div>

      <div class="screen modal-screen" data-screen="collection">
        <div class="screen-backdrop" style="background-image:url('${ART.collectionBackground}')"></div>
        <div class="collection-shell glass-panel">
          <div class="panel-heading">
            <button class="icon-btn" data-action="back-to-village">←</button>
            <div><small>Creature Collector</small><h2>Collection</h2></div>
            <div class="badge-pill" data-bind="collection-summary"></div>
          </div>
          <div class="collection-grid" data-bind="collection-grid"></div>
        </div>
      </div>

      <div class="screen modal-screen" data-screen="profile">
        <div class="screen-backdrop" style="background-image:url('${ART.profileBackground}')"></div>
        <div class="profile-shell glass-panel">
          <div class="panel-heading">
            <button class="icon-btn" data-action="close-profile">←</button>
            <div><small data-bind="profile-rarity"></small><h2 data-bind="profile-name"></h2></div>
            <button class="pill-btn" data-action="profile-pet">Pet</button>
          </div>
          <div class="profile-layout">
            <div class="profile-visual">
              <img data-bind="profile-image" alt="Animal portrait" />
              <div class="profile-eyeshine"></div>
            </div>
            <div class="profile-info">
              <p data-bind="profile-species"></p>
              <div class="profile-stats" data-bind="profile-stats"></div>
              <div class="profile-ability"><small>Special ability</small><p data-bind="profile-ability"></p></div>
              <div class="button-stack">
                <button class="primary-btn" data-action="send-to-village" data-bind="profile-village-btn"></button>
                <button class="secondary-btn" data-action="close-profile">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="screen modal-screen" data-screen="aurora-reveal">
        <div class="modal-card modal-card--celebration aurora-modal">
          <small>Village Guardian</small>
          <h2>Aurora</h2>
          <img class="aurora-modal__image" src="${ANIMALS.aurora.imageUrl}" alt="Aurora the Celestial Bunny" />
          <p>The village lights dim. A single star falls. Aurora rises from the glow and every animal gathers close.</p>
          <div class="badge-pill">Achievement unlocked: A Light in the Meadow</div>
          <div class="button-stack">
            <button class="primary-btn" data-action="close-aurora-reveal">Welcome Aurora</button>
          </div>
        </div>
      </div>

      <div class="screen modal-screen" data-screen="shop">
        <div class="screen-backdrop" style="background-image:url('${ART.shopBackground}')"></div>
        <div class="shop-shell glass-panel">
          <div class="panel-heading">
            <button class="icon-btn" data-action="back-to-village">←</button>
            <div><small>Cozy boutique</small><h2>Shop</h2></div>
            <div class="badge-pill">Acorn cap $3.99</div>
          </div>
          <div class="shop-section"><h3>Acorn Packs</h3><div class="shop-grid" data-bind="shop-acorns"></div></div>
          <div class="shop-section"><h3>Premium Eggs &amp; Pass</h3><div class="shop-grid" data-bind="shop-premium"></div></div>
        </div>
      </div>

      <div class="screen modal-screen" data-screen="settings">
        <div class="screen-backdrop" style="background-image:url('${ART.settingsBackground}')"></div>
        <div class="settings-shell glass-panel">
          <div class="panel-heading">
            <button class="icon-btn" data-action="back-to-village">←</button>
            <div><small>Player profile</small><h2>Settings</h2></div>
            <div class="badge-pill" data-bind="player-level-badge"></div>
          </div>
          <div class="settings-stack">
            <label class="name-card"><span>Player name</span><input type="text" maxlength="18" data-bind="player-name-input" /></label>
            <div class="metric-grid metric-grid--wide" data-bind="profile-metrics"></div>
            <div class="toggle-list">
              <button class="toggle-row" data-toggle="sound"><span>Sound</span><strong data-bind="toggle-sound"></strong></button>
              <button class="toggle-row" data-toggle="music"><span>Music</span><strong data-bind="toggle-music"></strong></button>
              <button class="toggle-row" data-toggle="haptics"><span>Haptics</span><strong data-bind="toggle-haptics"></strong></button>
            </div>
            <button class="secondary-btn" data-action="restore-purchases">Restore Purchases</button>
          </div>
        </div>
      </div>

      <div class="toast" data-bind="toast"></div>
    </div>
  `;

  // Inject animation styles
  injectAnimalAnimStyles();

  const ui = {
    screens: new Map(Array.from(root.querySelectorAll('[data-screen]')).map((node) => [node.dataset.screen, node])),
    binds: new Map(Array.from(root.querySelectorAll('[data-bind]')).map((node) => [node.dataset.bind, node])),
    actions: Array.from(root.querySelectorAll('[data-action]')),
    toggles: Array.from(root.querySelectorAll('[data-toggle]')),
    board: root.querySelector('[data-bind="board"]'),
    toast: root.querySelector('[data-bind="toast"]'),
  };

  const background = createBackground(root.querySelector('#bg-canvas'));
  const particles = createParticleSystem(root.querySelector('.paw-app'));

  const state = {
    save: loadSave(),
    currentScreen: 'loading',
    previousScreen: 'village',
    currentLevelNumber: 1,
    currentAnimalId: 'clover',
    gameplay: null,
    animationFrame: null,
    lastTickAt: performance.now(),
    activePower: null,
    recentRevealAnimalId: null,
    boardLayout: { cellSize: 0, boardWidth: 0, boardHeight: 0 },
    toastTimer: null,
    usedPowerThisLevel: false,
  };

  // ─── Screen transitions ──────────────────────────────────────────────────
  function setScreen(name, opts = {}) {
    const prev = state.currentScreen;
    ui.screens.forEach((node, key) => node.classList.toggle('active', key === name));
    if (!['profile', 'settings', 'shop', 'level-complete'].includes(name)) state.previousScreen = name;
    state.currentScreen = name;

    // Entrance transitions
    if (name === 'village') animateVillageEntrance();
    if (name === 'puzzle' && !opts.skipTransition) animateBoardEntrance();
  }

  function animateVillageEntrance() {
    const animalEls = root.querySelectorAll('.village-animal');
    animalEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px) scale(0.7)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(.18,.9,.2,1.2)';
        el.style.opacity = '1';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 500);
      }, 200 + i * 120);
    });
  }

  function animateBoardEntrance() {
    setTimeout(() => {
      const tiles = root.querySelectorAll('.egg-tile');
      const cols = BOARD_COLUMNS;
      tiles.forEach((tile, i) => {
        const col = i % cols;
        tile.style.opacity = '0';
        tile.style.transform = 'translateY(-40px)';
        setTimeout(() => {
          tile.style.transition = 'opacity 0.3s ease, transform 0.35s cubic-bezier(.18,.9,.2,1.1)';
          tile.style.opacity = '1';
          tile.style.transform = '';
          setTimeout(() => { tile.style.transition = ''; }, 400);
        }, col * 40);
      });
    }, 50);
  }

  // ─── Power-up visual FX ──────────────────────────────────────────────────
  function showPowerFx(powerKey) {
    const fx = POWER_FX[powerKey];
    if (!fx) return;
    const overlay = ui.binds.get('power-fx-overlay');
    if (!overlay) return;
    overlay.innerHTML = `<div class="pfx-banner" style="--pfx-color:${fx.color}">${fx.icon} ${fx.label}</div>`;
    overlay.classList.add('pfx-active');
    setTimeout(() => { overlay.classList.remove('pfx-active'); overlay.innerHTML = ''; }, 900);
  }

  // ─── Toast & haptics ─────────────────────────────────────────────────────
  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add('active');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => ui.toast.classList.remove('active'), 2600);
  }
  function maybeVibrate(pattern = 20) { if (state.save.settings.haptics) navigator.vibrate?.(pattern); }

  async function playSfx(key) {
    if (!state.save.settings.sound) return;
    const url = AUDIO.sfx[key];
    if (!url) return;
    try { await audioManager.playSFX(url); } catch (e) { console.warn('SFX', key, e); }
  }
  async function ensureBgm(track = 'meadow') {
    if (!state.save.settings.music) return;
    const url = AUDIO.bgm[track];
    if (!url) return;
    try { await audioManager.playBGM(url, { volume: track === 'reveal' ? 0.6 : 0.52, fadeIn: 0.8 }); } catch (e) { console.warn('BGM', e); }
  }

  // ─── Currency UI ─────────────────────────────────────────────────────────
  function updateCurrencyUI() {
    ui.binds.get('paws-balance').textContent = `${state.save.paws}`;
    ui.binds.get('acorns-balance').textContent = `${state.save.acorns}`;
  }

  // ─── Village rendering ───────────────────────────────────────────────────
  function renderVillageBuildShop() {
    const container = ui.binds.get('village-build-shop');
    container.innerHTML = '';
    const owned = new Set(buildStarterVillage(state.save));
    ui.binds.get('build-count').textContent = `${owned.size}/${BUILDINGS.length}`;
    BUILDINGS.forEach((building) => {
      const card = document.createElement('button');
      const isOwned = owned.has(building.id);
      card.className = `build-card ${isOwned ? 'is-owned' : ''}`;
      card.disabled = isOwned;
      card.innerHTML = `<strong>${building.name}</strong><small>${building.blurb}</small><span>${isOwned ? 'Built' : `${building.cost} Paws`}</span>`;
      card.addEventListener('click', () => attemptBuild(building.id));
      container.appendChild(card);
    });
  }

  function updateVillageUI() {
    updateCurrencyUI();
    const foundCount = countFoundAnimals(state.save);
    const villageCount = countVillageAnimals(state.save);
    ui.binds.get('weather-label').textContent = getVillageWeather(state.save);
    ui.binds.get('found-animals-count').textContent = `${foundCount}/10`;
    ui.binds.get('village-animal-count').textContent = `${villageCount}`;
    ui.binds.get('village-visits').textContent = `${state.save.village.visits}`;
    ui.binds.get('aurora-progress').textContent = `${state.save.fragments.aurora}/12 fragments`;
    ui.binds.get('aurora-progress-bar').style.width = `${Math.min(100, (state.save.fragments.aurora / 12) * 100)}%`;
    const materiaUnlocked = state.save.unlockedSkins?.materia;
    ui.binds.get('skin-toggle-label').textContent = materiaUnlocked ? `Skin: ${state.save.selectedSkin === 'jewel' ? 'Jewel' : 'Materia'}` : 'Unlock Materia';
    ui.binds.get('village-message').textContent = allRaresFound(state.save)
      ? 'All five rares are gathered. Aurora fragments now shimmer across revisits.'
      : 'Raise your village, revisit old levels, and gather the five rare guardians.';
    const visitBonusButton = root.querySelector('[data-action="visit-bonus"]');
    if (visitBonusButton) {
      const can = !!state.save.village.returnBonusSeed;
      visitBonusButton.disabled = !can;
      visitBonusButton.textContent = can ? 'Collect Visit Bonus' : 'Visit Bonus Claimed';
    }
    renderVillageBuildings();
    renderVillageAnimals();
    renderVillageBuildShop();
  }

  function renderVillageBuildings() {
    const container = ui.binds.get('village-buildings');
    const owned = buildStarterVillage(state.save);
    container.innerHTML = '';
    owned.forEach((buildingId, index) => {
      const building = BUILDINGS.find((b) => b.id === buildingId);
      if (!building) return;
      const node = document.createElement('div');
      node.className = 'village-building';
      node.style.setProperty('--delay', `${index * 0.1}s`);
      node.innerHTML = `<strong>${building.name}</strong><small>${building.type}</small>`;
      container.appendChild(node);
    });
  }

  // ─── LIVING VILLAGE ANIMALS ──────────────────────────────────────────────
  function renderVillageAnimals() {
    const container = ui.binds.get('village-animals');
    container.innerHTML = '';

    const villageAnimals = COLLECTION_ORDER.filter(
      (id) => state.save.animalProfiles?.[id]?.found && state.save.animalProfiles?.[id]?.inVillage
    );

    villageAnimals.forEach((id, index) => {
      const animal = ANIMALS[id];
      const animCfg = ANIMAL_ANIM[id] ?? { cls: 'anim-bramble', isRare: false };
      const card = document.createElement('button');
      card.className = `village-animal rarity-${animal.rarity} ${animCfg.cls}`;
      card.dataset.animalId = id;

      // Staggered entrance
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px) scale(0.7)';

      card.innerHTML = `<img src="${animal.imageUrl}" alt="${animal.name}" /><span>${animal.name}</span>`;

      // Tap: bounce + heart particle + sfx
      card.addEventListener('click', () => {
        // Bounce animation
        card.classList.add('animal-tapped');
        setTimeout(() => card.classList.remove('animal-tapped'), 500);

        // Heart burst
        spawnHeartParticle(container, card);

        playSfx('tap');
        openAnimalProfile(id);
      });

      container.appendChild(card);

      // Staggered entrance animation
      setTimeout(() => {
        card.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(.18,.9,.2,1.2)';
        card.style.opacity = '1';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 500);
      }, 150 + index * 130);
    });
  }

  function spawnHeartParticle(container, card) {
    const heart = document.createElement('span');
    heart.className = 'animal-heart';
    heart.textContent = ['💛', '💚', '🤍', '💜', '🩵'][Math.floor(Math.random() * 5)];
    const rect = card.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    heart.style.left = `${rect.left - cRect.left + rect.width / 2 - 12}px`;
    heart.style.top = `${rect.top - cRect.top - 10}px`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }

  // ─── Bottom nav ──────────────────────────────────────────────────────────
  function renderBottomNav() {
    const nav = ui.binds.get('bottom-nav');
    nav.innerHTML = '';
    NAV_ITEMS.forEach((item) => {
      const button = document.createElement('button');
      button.className = `bottom-nav__item ${state.currentScreen === item.key ? 'active' : ''}`;
      button.textContent = item.label;
      button.addEventListener('click', () => {
        if (item.key === 'levels') openLevelSelect();
        else if (item.key === 'village') openVillage(false);
        else if (item.key === 'collection') openCollection();
        else if (item.key === 'shop') openShop();
        else if (item.key === 'profile') openSettings();
      });
      nav.appendChild(button);
    });
  }

  function renderLevelMap() {
    const container = ui.binds.get('level-map');
    container.innerHTML = '';
    levels.forEach((level) => {
      const result = getLevelResult(state.save, level.level);
      const unlocked = level.level <= state.save.highestUnlockedLevel;
      const card = document.createElement('button');
      card.className = `level-card ${unlocked ? '' : 'level-card--locked'}`;
      card.disabled = !unlocked;
      const revisitFlags = [];
      if (result.revisits >= 1) revisitFlags.push('🧩 fragment');
      if (result.revisits >= 3) revisitFlags.push('✨ rare chance');
      if (result.revisits >= 5) revisitFlags.push('📜 lore');
      if (result.revisits >= 10) revisitFlags.push('🏅 veteran');
      card.innerHTML = `
        <div class="level-card__badge">Lv ${level.level}</div>
        <div class="level-card__body">
          <strong>${level.targetScore}</strong>
          <small>${result.stars ? '★'.repeat(result.stars) : unlocked ? 'New route' : 'Locked'}</small>
          <p>${revisitFlags[0] ?? level.flavor}</p>
        </div>`;
      card.addEventListener('click', () => startLevel(level.level));
      container.appendChild(card);
    });
  }

  function renderCollection() {
    const container = ui.binds.get('collection-grid');
    container.innerHTML = '';
    ui.binds.get('collection-summary').textContent = `${countFoundAnimals(state.save)}/${COLLECTION_ORDER.length} found`;
    COLLECTION_ORDER.forEach((id) => {
      const animal = ANIMALS[id];
      const profile = state.save.animalProfiles?.[id];
      const found = !!profile?.found;
      const card = document.createElement('button');
      card.className = `collection-card ${found ? 'is-found' : 'is-hidden'} rarity-${animal.rarity}`;
      card.innerHTML = found
        ? `<img src="${animal.imageUrl}" alt="${animal.name}" /><strong>${animal.name}</strong><small>${animal.rarityLabel}</small>`
        : `<div class="collection-card__silhouette">?</div><strong>${animal.rarity >= 5 && !allRaresFound(state.save) ? '???' : animal.name}</strong><small>${animal.hint}</small>`;
      if (found) card.addEventListener('click', () => openAnimalProfile(id));
      container.appendChild(card);
    });
  }

  function renderShop() {
    const acornContainer = ui.binds.get('shop-acorns');
    const premiumContainer = ui.binds.get('shop-premium');
    acornContainer.innerHTML = '';
    premiumContainer.innerHTML = '';
    [['Handful','$0.49','50 Acorns'],['Basket','$0.99','120 Acorns'],['Bushel','$1.99','280 Acorns'],['Harvest','$2.99','450 Acorns ⭐'],['Bounty','$3.99','650 Acorns']].forEach(([name, price, value]) => {
      const card = document.createElement('button');
      card.className = 'shop-card';
      card.innerHTML = `<strong>${name}</strong><small>${value}</small><span>${price}</span>`;
      card.addEventListener('click', () => showToast('Storefront stub: pricing card ready for mobile wrapper billing.'));
      acornContainer.appendChild(card);
    });
    [['Premium Egg','$0.99','1 egg · 0.5% Aurora chance'],['Premium Egg Bundle','$2.99','4 eggs · best way to chase rares'],['Season Pass','$2.99/mo','Aurora petals, decor, daily acorns'],['Decor Bundle','$0.49','Lantern path + flower arch']].forEach(([name, price, value]) => {
      const card = document.createElement('button');
      card.className = 'shop-card shop-card--warm';
      card.innerHTML = `<strong>${name}</strong><small>${value}</small><span>${price}</span>`;
      card.addEventListener('click', () => showToast('Shop UI is ready for store SDK hookup.'));
      premiumContainer.appendChild(card);
    });
  }

  function renderSettings() {
    ui.binds.get('toggle-sound').textContent = state.save.settings.sound ? 'On' : 'Off';
    ui.binds.get('toggle-music').textContent = state.save.settings.music ? 'On' : 'Off';
    ui.binds.get('toggle-haptics').textContent = state.save.settings.haptics ? 'On' : 'Off';
    ui.binds.get('player-level-badge').textContent = `Village ${Math.max(1, Math.ceil(state.save.stats.totalLevelsCleared / 3))}`;
    ui.binds.get('player-name-input').value = state.save.playerName;
    const metrics = ui.binds.get('profile-metrics');
    metrics.innerHTML = '';
    [['Collection',`${countFoundAnimals(state.save)}/${COLLECTION_ORDER.length}`],['Gold Wins',`${state.save.stats.goldWins}`],['No-Power Clears',`${state.save.stats.noPowerWins}`],['Village Builds',`${state.save.stats.totalVillageBuilds}`]].forEach(([label, value]) => {
      const tile = document.createElement('div');
      tile.className = 'metric-card';
      tile.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      metrics.appendChild(tile);
    });
  }

  // ─── Puzzle HUD & board ──────────────────────────────────────────────────
  function updatePowerBar() {
    const container = ui.binds.get('power-bar');
    if (!state.gameplay) { container.innerHTML = ''; return; }
    container.innerHTML = '';
    ['pawSwipe','vineBurst','rainbowEgg','nestSpin','dewdropFreeze','grandHatch'].forEach((key) => {
      const power = POWER_UPS[key];
      const button = document.createElement('button');
      const count = state.save.inventory[key] ?? 0;
      button.className = `power-card ${state.activePower === key ? 'active' : ''}`;
      button.disabled = count <= 0;
      button.innerHTML = `<span>${power.icon}</span><strong>${power.label}</strong><small>${count} ready</small>`;
      button.addEventListener('click', async () => {
        await playSfx('tap');
        if (key === 'dewdropFreeze') { await usePower('dewdropFreeze', 0, 0); return; }
        state.activePower = state.activePower === key ? null : key;
        showToast(state.activePower ? `${power.label} primed.` : 'Power-up cancelled.');
        updatePowerBar();
      });
      container.appendChild(button);
    });
  }

  function updatePuzzleHUD() {
    if (!state.gameplay) return;
    const gp = state.gameplay;
    ui.binds.get('score').textContent = `${gp.score}`;
    ui.binds.get('target').textContent = `${gp.level.targetScore}`;
    ui.binds.get('moves-left').textContent = `${gp.movesLeft}`;
    ui.binds.get('target-progress').style.width = `${Math.min(100, (gp.score / gp.level.targetScore) * 100)}%`;
    ui.binds.get('level-name').textContent = `Level ${gp.level.level} · ${WORLD.name}`;
    ui.binds.get('objective-summary').textContent = gp.level.objectives.map((o) => o.label).join(' • ');
    const banner = ui.binds.get('combo-banner');
    banner.textContent = gp.comboMultiplier > 1 ? `Dream Combo x${gp.comboMultiplier}` : 'Dream Combo x1';
    banner.classList.toggle('hot', gp.comboMultiplier > 1);
    // Combo pop animation
    if (gp.comboMultiplier > 1) { banner.classList.add('combo-pop'); setTimeout(() => banner.classList.remove('combo-pop'), 320); }
    ui.binds.get('vine-timer').textContent = gp.freezeSeconds > 0 ? `❄ ${gp.freezeSeconds.toFixed(1)}s freeze` : `🌿 vines in ${gp.vineTimer.toFixed(1)}s`;
    updatePowerBar();
  }

  function updateBoardLayout() {
    const boardWrap = ui.board.parentElement;
    const availableWidth = Math.min(boardWrap.clientWidth - 18, window.innerWidth - 30);
    const cellSize = Math.floor(availableWidth / BOARD_COLUMNS);
    state.boardLayout = { cellSize, boardWidth: cellSize * BOARD_COLUMNS, boardHeight: cellSize * BOARD_ROWS };
    ui.board.style.width = `${state.boardLayout.boardWidth}px`;
    ui.board.style.height = `${state.boardLayout.boardHeight}px`;
  }

  function buildTileElement(cell, row, col) {
    const button = document.createElement('button');
    button.className = `egg-tile obstacle-${cell.obstacleType ?? 'none'}`;
    button.dataset.row = String(row);
    button.dataset.col = String(col);
    button.dataset.eggId = cell.id;
    button.style.width = `${state.boardLayout.cellSize}px`;
    button.style.height = `${state.boardLayout.cellSize}px`;
    button.style.left = `${col * state.boardLayout.cellSize}px`;
    button.style.top = `${row * state.boardLayout.cellSize}px`;
    const img = getEggImage(cell.eggKey, state.save.selectedSkin);
    button.style.setProperty('--egg-image', `url(${img})`);
    button.style.setProperty('--egg-glow', EGG_TYPES[cell.eggKey].glow);
    button.innerHTML = `
      <span class="egg-tile__core" style="background-image:url('${img}')"></span>
      <span class="egg-tile__shine"></span>
      <span class="egg-tile__pulse"></span>
      ${cell.obstacleHits > 0 ? `<span class="egg-tile__shell hp-${cell.obstacleHits}">${cell.obstacleType}</span>` : ''}`;
    button.addEventListener('click', () => handleTileTap(row, col));
    return button;
  }

  function animateBoardTransition(previousBoard, nextBoard) {
    const previous = createPositionMap(previousBoard);
    const next = createPositionMap(nextBoard);
    next.forEach(({ row }, id) => {
      const tile = ui.board.querySelector(`[data-egg-id="${id}"]`);
      if (!tile) return;
      const from = previous.get(id);
      tile.classList.remove('tile-drop', 'tile-land');
      tile.style.removeProperty('--drop-distance');
      if (!from) {
        tile.classList.add('tile-drop');
        tile.style.setProperty('--drop-distance', `${state.boardLayout.cellSize}px`);
      } else if (from.row !== row) {
        tile.classList.add('tile-drop');
        tile.style.setProperty('--drop-distance', `${(from.row - row) * state.boardLayout.cellSize}px`);
      }
      requestAnimationFrame(() => tile.classList.add('tile-land'));
    });
  }

  function renderBoard(previousBoard = null) {
    if (!state.gameplay) return;
    updateBoardLayout();
    ui.board.innerHTML = '';
    state.gameplay.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => { ui.board.appendChild(buildTileElement(cell, rowIndex, colIndex)); });
    });
    if (previousBoard) animateBoardTransition(previousBoard, state.gameplay.board);
  }

  // ─── Screen navigation ───────────────────────────────────────────────────
  function openVillage(countVisit = true) {
    if (countVisit) state.save = visitVillage(state.save);
    setScreen('village');
    updateVillageUI();
    renderBottomNav();
    ensureBgm('meadow');
  }

  function openLevelSelect() { setScreen('levels'); renderBottomNav(); updateVillageUI(); renderLevelMap(); }
  function openCollection() { setScreen('collection'); renderBottomNav(); renderCollection(); }
  function openSettings() { setScreen('settings'); renderBottomNav(); renderSettings(); }
  function openShop() { setScreen('shop'); renderBottomNav(); renderShop(); }

  function openAnimalProfile(animalId) {
    state.currentAnimalId = animalId;
    const animal = ANIMALS[animalId];
    const profile = state.save.animalProfiles?.[animalId];
    ui.binds.get('profile-name').textContent = animal.name;
    ui.binds.get('profile-rarity').textContent = animal.rarityLabel;
    ui.binds.get('profile-image').src = animal.imageUrl;
    ui.binds.get('profile-image').alt = animal.name;
    ui.binds.get('profile-species').textContent = animal.species;
    ui.binds.get('profile-ability').textContent = animal.ability;
    ui.binds.get('profile-village-btn').textContent = profile?.inVillage ? 'Rest in Collection' : 'Send to Village';
    ui.binds.get('profile-stats').innerHTML = `
      <div class="metric-card"><span>Found</span><strong>${formatDate(profile?.foundAt)}</strong></div>
      <div class="metric-card"><span>Level</span><strong>${profile?.levelFound ?? 'Village Gift'}</strong></div>
      <div class="metric-card"><span>Visits</span><strong>${profile?.timesVisitedVillage ?? 0}</strong></div>`;
    setScreen('profile');
  }

  // ─── Rewards & unlocks ───────────────────────────────────────────────────
  function unlockRewardsForLevel(levelNumber, stars) {
    const level = getLevelByNumber(levelNumber);
    const result = getLevelResult(state.save, levelNumber);
    const rewards = { ...level.reward };
    state.save = addCurrencies(state.save, { paws: rewards.paws, acorns: rewards.acorns });
    state.save = addFragments(state.save, { [rewards.fragmentEggKey]: rewards.fragmentAmount });
    const revisitBonus = {};
    if (result.revisits >= 1) revisitBonus[rewards.fragmentEggKey] = (revisitBonus[rewards.fragmentEggKey] ?? 0) + 1;
    if (result.revisits >= 3) revisitBonus.amethyst = (revisitBonus.amethyst ?? 0) + 1;
    if (result.revisits >= 5) state.save.village.loreUnlocked = Array.from(new Set([...(state.save.village.loreUnlocked ?? []), `Level ${levelNumber} lore`]));
    if (Object.keys(revisitBonus).length) state.save = addFragments(state.save, revisitBonus);
    if (stars >= 3 && allRaresFound(state.save) && !result.auroraFragmentFound) {
      state.save = markAuroraFragmentLevel(state.save, levelNumber);
      showToast('Aurora fragment shimmered into view on this golden revisit!');
    }
    attemptHatchUnlock(level.reward.fragmentEggKey, levelNumber);
    if (state.save.fragments.aurora >= ANIMALS.aurora.fragmentTarget) attemptHatchUnlock('aurora', levelNumber);
  }

  function attemptHatchUnlock(eggKey, levelNumber) {
    const hatchables = COLLECTION_ORDER.filter((animalId) => {
      const animal = ANIMALS[animalId];
      if (animal.eggKey !== eggKey && animalId !== 'aurora') return false;
      return !state.save.animalProfiles?.[animalId]?.found && (state.save.fragments?.[animalId === 'aurora' ? 'aurora' : eggKey] ?? 0) >= animal.fragmentTarget;
    });
    if (!hatchables.length) return;
    const hatched = hatchables[0];
    const animal = ANIMALS[hatched];
    state.save = unlockAnimal(state.save, hatched, levelNumber);
    state.recentRevealAnimalId = hatched;
    showToast(`${animal.name} hatched from a ${hatched === 'aurora' ? 'Falling Star Egg' : EGG_TYPES[eggKey].name}!`);
    if (hatched === 'aurora') {
      state.save.stats.lastAuroraRevealAt = new Date().toISOString();
      background.triggerAuroraReveal();
      playSfx('grandHatch');
      ensureBgm('reveal');
      setScreen('aurora-reveal');
    } else {
      playSfx(animal.rarity >= 3 ? 'rareFound' : 'crack');
    }
  }

  function evaluateBoardHealth() {
    if (!state.gameplay) return;
    if (!hasValidMove(state.gameplay.board)) {
      const previous = cloneBoard(state.gameplay.board);
      state.gameplay.board = shuffleBoard(state.gameplay.board, state.gameplay.level);
      renderBoard(previous);
      showToast('The meadow breeze reshuffled the eggs.');
    }
  }

  function objectiveStatus() {
    const gp = state.gameplay;
    if (!gp) return [];
    return gp.level.objectives.map((o) => {
      if (o.type === 'score') return gp.score >= o.target;
      if (o.type === 'obstacle') return gp.obstaclesCleared >= o.target;
      if (o.type === 'hatch') return gp.eggsHatched >= o.target;
      return false;
    });
  }
  function allObjectivesMet() { return objectiveStatus().every(Boolean); }

  // ─── Blast resolution with enhanced FX ──────────────────────────────────
  async function resolveBlast(cells, options = {}) {
    const gp = state.gameplay;
    if (!gp || gp.resolving) return;
    gp.resolving = true;

    const unique = [];
    const seen = new Set();
    cells.forEach((entry) => {
      const key = `${entry.row},${entry.col}`;
      if (!seen.has(key)) { seen.add(key); unique.push(entry); }
    });

    if (unique.length < 2 && !options.force) {
      gp.resolving = false;
      showToast('Match at least 2 eggs to hatch a burst.');
      return;
    }

    const clusterSize = unique.length;
    gp.comboMultiplier = clusterSize >= 3 ? Math.min(gp.comboMultiplier + 1, 6) : 1;
    const scoreGain = clusterSize * 110 + gp.comboMultiplier * 35 + (options.bonusScore ?? 0);
    gp.score += scoreGain;
    gp.eggsHatched += Math.max(0, clusterSize - Math.min(clusterSize, Math.floor(clusterSize / 4)));

    if (clusterSize >= 6) state.save = addInventory(state.save, { pawSwipe: 1 });
    if (clusterSize >= 8) state.save = addInventory(state.save, { vineBurst: 1 });
    if (clusterSize >= 10) state.save = addInventory(state.save, { rainbowEgg: 1 });

    // Combo multiplier screen edge pulse
    if (gp.comboMultiplier >= 3) {
      const app = root.querySelector('.paw-app');
      app.classList.add('combo-edge-pulse');
      setTimeout(() => app.classList.remove('combo-edge-pulse'), 500);
    }

    background.pulseBoardImpact(Math.min(2.5, clusterSize / 4));
    maybeVibrate(clusterSize >= 6 ? [20, 25, 20] : 18);
    await playSfx(clusterSize >= 6 ? 'combo' : 'crack');

    const shellRect = root.querySelector('.paw-app').getBoundingClientRect();
    unique.forEach(({ row, col, cell }) => {
      const tile = ui.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (!tile) return;

      // Flash tile white before blast
      tile.style.transition = 'filter 80ms ease';
      tile.style.filter = 'brightness(2.5)';
      setTimeout(() => { tile.style.filter = ''; tile.classList.add('blasting'); }, 80);

      const rect = tile.getBoundingClientRect();
      // Shard particles — more and bigger for large combos
      particles.burst({
        x: rect.left - shellRect.left + rect.width / 2,
        y: rect.top - shellRect.top + rect.height / 2,
        color: EGG_TYPES[cell.eggKey].accent,
        count: clusterSize >= 6 ? 20 : 12,
        big: clusterSize >= 6,
      });
    });

    // Power FX overlay
    if (options.powerKey) showPowerFx(options.powerKey);

    await wait(clusterSize >= 8 ? 280 : 170);

    const previous = cloneBoard(gp.board);
    const blastResult = applyBlast(gp.board, unique, gp.level);
    gp.board = blastResult.board;
    gp.obstaclesCleared += blastResult.obstacleClears;
    gp.movesLeft -= options.consumeMove === false ? 0 : 1;
    if (options.consumePower) { state.activePower = null; state.usedPowerThisLevel = true; }

    renderBoard(previous);
    evaluateBoardHealth();
    updatePuzzleHUD();
    gp.resolving = false;
    await maybeSpreadVines();
    checkPuzzleEnd();
  }

  async function maybeSpreadVines() {
    const gp = state.gameplay;
    if (!gp || gp.freezeSeconds > 0) return;
    gp.vineTimer -= 1;
    if (gp.vineTimer > 0) return;
    const previous = cloneBoard(gp.board);
    const grown = growVines(gp.board, gp.level, gp.level.level >= 16 ? 3 : 2);
    gp.board = grown.board;
    gp.vineTimer = gp.vineInterval;
    renderBoard(previous);
    updatePuzzleHUD();
    if (grown.touched.length) showToast('Vines crept across the meadow!');
  }

  async function usePower(powerKey, row, col) {
    const gp = state.gameplay;
    if (!gp || gp.resolving) return;

    if (powerKey === 'dewdropFreeze') {
      const updated = consumeInventory(state.save, 'dewdropFreeze', 1);
      if (!updated) { showToast('No Dewdrop Freeze left.'); return; }
      state.save = updated;
      gp.freezeSeconds = 15;
      gp.vineTimer = gp.vineInterval;
      state.usedPowerThisLevel = true;
      state.activePower = null;
      await playSfx('dewdropFreeze');
      showPowerFx('dewdropFreeze');
      showToast('Dewdrop Freeze stopped the vines.');
      updatePuzzleHUD();
      return;
    }

    const updated = consumeInventory(state.save, powerKey, 1);
    if (!updated) { showToast(`No ${POWER_UPS[powerKey].label} available.`); state.activePower = null; updatePowerBar(); return; }
    state.save = updated;

    let cells = [];
    if (powerKey === 'pawSwipe') { cells = getRowCells(gp.board, row); await playSfx('pawSwipe'); }
    else if (powerKey === 'vineBurst') { cells = getCrossCells(gp.board, row, col); await playSfx('vineBurst'); }
    else if (powerKey === 'rainbowEgg') {
      const cell = gp.board[row]?.[col];
      if (!cell) { showToast('Tap an egg to trigger Rainbow Egg.'); state.save = addInventory(state.save, { rainbowEgg: 1 }); return; }
      cells = getColorCells(gp.board, cell.eggKey); await playSfx('rainbowEgg');
    }
    else if (powerKey === 'nestSpin') { cells = getAreaCells(gp.board, row, col, 1); await playSfx('vineBurst'); }
    else if (powerKey === 'grandHatch') { cells = getAllCells(gp.board); background.triggerAuroraReveal(); await playSfx('grandHatch'); }

    if (!cells.length) { showToast('No eggs were ready for that power.'); updatePowerBar(); return; }
    await resolveBlast(cells, { force: true, consumePower: true, bonusScore: 220, consumeMove: powerKey === 'grandHatch' ? false : true, powerKey });
  }

  async function handleTileTap(row, col) {
    const gp = state.gameplay;
    if (!gp || gp.resolving) return;
    const cell = gp.board[row][col];
    if (!cell) return;
    if (state.activePower) { await usePower(state.activePower, row, col); return; }
    const cluster = getCluster(gp.board, row, col);
    await resolveBlast(cluster);
  }

  function createGameplayState(levelNumber) {
    const level = getLevelByNumber(levelNumber);
    let board = generateBoard(level);
    if (getCluster(board, 0, 0).length < 2 && getCluster(board, 0, 1).length < 2) {
      let openingEggKey = board[0][0]?.eggKey;
      for (let r = 0; r < BOARD_ROWS; r += 1) {
        for (let c = 0; c < BOARD_COLUMNS; c += 1) {
          const cluster = getCluster(board, r, c);
          if (cluster.length >= 2) { openingEggKey = cluster[0].cell.eggKey; r = BOARD_ROWS; break; }
        }
      }
      board[0][0] = { ...board[0][0], eggKey: openingEggKey, obstacleType: null, obstacleHits: 0 };
      board[0][1] = { ...board[0][1], eggKey: openingEggKey, obstacleType: null, obstacleHits: 0 };
    }
    return { level, board, score: 0, comboMultiplier: 1, movesLeft: level.moves, eggsHatched: 0, obstaclesCleared: 0, vineInterval: level.level >= 16 ? 2 : 3, vineTimer: level.level >= 16 ? 2.6 : 3.5, freezeSeconds: 0, resolving: false, startedAt: performance.now() };
  }

  function startLevel(levelNumber) {
    state.currentLevelNumber = levelNumber;
    state.gameplay = createGameplayState(levelNumber);
    state.activePower = null;
    state.usedPowerThisLevel = false;
    setScreen('puzzle');
    renderBoard();
    updatePuzzleHUD();
    animateBoardEntrance();
    ensureBgm('meadow');
  }

  function applyVillageThresholds() {
    const villageCount = countVillageAnimals(state.save);
    if (villageCount >= 10) showToast('Every roof now blooms with flowers.');
    if (villageCount >= 20) showToast('Fireflies now gather in Cloverfield Meadow.');
    if (villageCount >= 30) showToast('A rainbow may appear after every rain.');
  }

  function finishLevel() {
    const gp = state.gameplay;
    if (!gp) return;
    const stars = starsForResult(gp.level, gp.score, gp.movesLeft);
    state.save = recordLevelOutcome(state.save, gp.level.level, { score: gp.score, stars, movesUsed: gp.level.moves - gp.movesLeft, usedPowerUp: state.usedPowerThisLevel });
    unlockRewardsForLevel(gp.level.level, stars);
    if (gp.level.level >= 25) state.save = unlockMateriaSkin(state.save);
    updateVillageUI(); renderCollection(); renderLevelMap(); applyVillageThresholds();
    ui.binds.get('complete-title').textContent = stars >= 3 ? 'Golden Hatch!' : stars === 2 ? 'Lovely Clear!' : 'Meadow Saved!';
    ui.binds.get('complete-stars').textContent = '★'.repeat(stars).padEnd(3, '☆');
    ui.binds.get('complete-summary').textContent = `Score ${gp.score} · ${pluralize(gp.movesLeft, 'move')} left · ${pluralize(gp.obstaclesCleared, 'obstacle')} cleared.`;
    ui.binds.get('complete-rewards').innerHTML = `
      <div class="reward-chip">🐾 +${gp.level.reward.paws}</div>
      <div class="reward-chip">🌰 +${gp.level.reward.acorns}</div>
      <div class="reward-chip">🥚 ${gp.level.reward.fragmentAmount} ${EGG_TYPES[gp.level.reward.fragmentEggKey].name} fragment</div>`;
    const revealPanel = ui.binds.get('reveal-panel');
    if (state.recentRevealAnimalId) {
      const animal = ANIMALS[state.recentRevealAnimalId];
      revealPanel.innerHTML = `<div class="reveal-card rarity-${animal.rarity}"><img src="${animal.imageUrl}" alt="${animal.name}" /><div><small>${animal.rarityLabel}</small><strong>${animal.name} joined your village!</strong><p>${animal.ability}</p></div></div>`;
    } else { revealPanel.innerHTML = ''; }
    particles.confetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.28 });
    playSfx('win'); maybeVibrate([25, 30, 25, 35]);
    setScreen('level-complete');
    state.recentRevealAnimalId = null;
  }

  function failLevel() {
    setScreen('village'); updateVillageUI(); renderBottomNav();
    showToast('The meadow needs another try.'); playSfx('fail');
  }

  function checkPuzzleEnd() {
    const gp = state.gameplay;
    if (!gp) return;
    if (gp.score >= gp.level.targetScore && allObjectivesMet()) { finishLevel(); return; }
    if (gp.movesLeft <= 0) { allObjectivesMet() ? finishLevel() : failLevel(); return; }
    if (countObstacleCells(gp.board) >= BOARD_COLUMNS * BOARD_ROWS * 0.86) failLevel();
  }

  function tickGameplay(deltaSec) {
    const gp = state.gameplay;
    if (!gp || state.currentScreen !== 'puzzle') return;
    if (gp.freezeSeconds > 0) gp.freezeSeconds = Math.max(0, gp.freezeSeconds - deltaSec);
    if (!gp.freezeSeconds) gp.vineTimer = Math.max(0, gp.vineTimer - deltaSec * 0.14);
    updatePuzzleHUD();
  }

  async function collectVisitBonus() {
    if (!state.save.village.returnBonusSeed) { showToast('Come back to the village later for another welcome gift.'); return; }
    const bonusPaws = 18 + Math.min(60, state.save.village.visits * 2);
    const bonusAcorns = state.save.village.visits % 7 === 0 ? 3 : 0;
    state.save = addCurrencies(state.save, { paws: bonusPaws, acorns: bonusAcorns });
    if (state.save.village.visits % 3 === 0) { state.save = addFragments(state.save, { amethyst: 1 }); showToast(`Visit bonus! +${bonusPaws} Paws and a rare fragment shimmered in.`); }
    else if (bonusAcorns > 0) { showToast(`Visit bonus! +${bonusPaws} Paws and +${bonusAcorns} Acorns.`); }
    else { showToast(`Animals welcomed you with +${bonusPaws} Paws.`); }
    state.save = { ...state.save, village: { ...state.save.village, returnBonusSeed: 0 } };
    persistSave(state.save); updateVillageUI();
  }

  function attemptBuild(buildingId) {
    const updated = buildVillageStructure(state.save, buildingId);
    if (!updated) { showToast('Not enough Paws for that build yet.'); return; }
    state.save = updated; updateVillageUI();
    showToast('A new meadow build now decorates your village.');
  }

  function toggleSkin() {
    if (!state.save.unlockedSkins?.materia) {
      if (state.save.highestUnlockedLevel >= 25) { state.save = unlockMateriaSkin(state.save); }
      else if (state.save.acorns >= (SKINS.materia.acornCost ?? 99)) { state.save = addCurrencies(state.save, { acorns: -(SKINS.materia.acornCost ?? 99) }); state.save = unlockMateriaSkin(state.save); showToast('Materia Eggs unlocked with Acorns.'); }
      else { showToast('Reach Level 25 or save 99 Acorns for Materia Eggs.'); return; }
    }
    const nextSkin = state.save.selectedSkin === 'jewel' ? 'materia' : 'jewel';
    state.save = selectSkin(state.save, nextSkin);
    showToast(`Board skin changed to ${state.save.selectedSkin === 'jewel' ? 'Jewel Eggs' : 'Materia Eggs'}.`);
    if (state.currentScreen === 'puzzle') renderBoard();
    updateVillageUI(); renderLevelMap();
  }

  function handleAction(action) {
    switch (action) {
      case 'enter-village': openVillage(); break;
      case 'visit-bonus': collectVisitBonus(); break;
      case 'open-shop': openShop(); break;
      case 'open-level-select': openLevelSelect(); break;
      case 'back-to-village': case 'return-to-village': case 'leave-puzzle': openVillage(false); break;
      case 'open-settings': openSettings(); break;
      case 'close-profile': openCollection(); break;
      case 'profile-pet': maybeVibrate(16); showToast(`${ANIMALS[state.currentAnimalId].name} chirped happily.`); break;
      case 'send-to-village': { const cur = state.save.animalProfiles?.[state.currentAnimalId]; state.save = setAnimalVillageState(state.save, state.currentAnimalId, !cur?.inVillage); openAnimalProfile(state.currentAnimalId); updateVillageUI(); break; }
      case 'next-level': startLevel(Math.min(25, state.currentLevelNumber + 1)); break;
      case 'close-aurora-reveal': openVillage(false); break;
      case 'toggle-skin': toggleSkin(); break;
      case 'restore-purchases': showToast('Restore purchases hook is ready for mobile wrapper billing.'); break;
      default: break;
    }
  }

  ui.actions.forEach((button) => {
    button.addEventListener('click', async () => { await playSfx('tap'); handleAction(button.dataset.action); });
  });
  ui.toggles.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.toggle;
      state.save = updateSettings(state.save, { [key]: !state.save.settings[key] });
      if (key === 'music') { if (state.save.settings.music) { ensureBgm('meadow'); audioManager.resume(); } else { audioManager.pause(); } }
      renderSettings();
    });
  });
  ui.binds.get('player-name-input').addEventListener('change', (event) => {
    state.save = renamePlayer(state.save, event.target.value);
    showToast(`Welcome, ${state.save.playerName}.`);
  });

  function loop(now) {
    const delta = Math.min(0.05, (now - state.lastTickAt) / 1000);
    state.lastTickAt = now;
    background.update();
    tickGameplay(delta);
    state.animationFrame = requestAnimationFrame(loop);
  }

  function handleResize() {
    if (state.currentScreen === 'puzzle' && state.gameplay) { renderBoard(); updatePuzzleHUD(); }
  }
  window.addEventListener('resize', handleResize);

  function boot() {
    state.save = unlockAnimal(state.save, 'clover', 1);
    state.save = unlockAnimal(state.save, 'bramble', 3);
    renderBottomNav(); updateVillageUI(); renderLevelMap(); renderCollection(); renderShop(); renderSettings();
    state.animationFrame = requestAnimationFrame(loop);
    ensureBgm('meadow');
  }

  boot();

  return {
    destroy() {
      cancelAnimationFrame(state.animationFrame);
      window.removeEventListener('resize', handleResize);
      background.destroy(); particles.destroy();
      persistSave(state.save); audioManager.destroy();
    },
    buildVillageStructure: attemptBuild,
  };
}

// ─── Animal animation CSS (injected at runtime) ───────────────────────────
function injectAnimalAnimStyles() {
  if (document.getElementById('paw-animal-anim-styles')) return;
  const style = document.createElement('style');
  style.id = 'paw-animal-anim-styles';
  style.textContent = `
    /* ── Clover (bunny) — hop patrol ── */
    .anim-clover { animation: cloverHop 12s ease-in-out infinite; }
    .anim-clover img { animation: earTwitch 3s ease-in-out infinite; }
    @keyframes cloverHop {
      0%,100% { transform: translateX(0) translateY(0); }
      15%      { transform: translateX(0) translateY(-16px); }
      18%      { transform: translateX(0) translateY(0); }
      30%      { transform: translateX(0) translateY(-16px); }
      33%      { transform: translateX(0) translateY(0); }
      50%      { transform: translateX(36px) translateY(0); }
      65%      { transform: translateX(36px) translateY(-16px); }
      68%      { transform: translateX(36px) translateY(0); }
      85%      { transform: translateX(0) translateY(0); }
    }
    @keyframes earTwitch {
      0%,85%,100% { transform: scaleX(1); }
      88%  { transform: scaleX(1.05) skewX(-4deg); }
      93%  { transform: scaleX(0.96) skewX(3deg); }
      97%  { transform: scaleX(1); }
    }

    /* ── Bramble (hedgehog) — waddle & sniff ── */
    .anim-bramble { animation: brambleWaddle 6s ease-in-out infinite; }
    .anim-bramble img { animation: brambleSniff 5.2s ease-in-out infinite; }
    @keyframes brambleWaddle {
      0%,100% { transform: translateX(0) rotate(0deg); }
      25%     { transform: translateX(18px) rotate(2.5deg); }
      50%     { transform: translateX(0) rotate(0deg); }
      75%     { transform: translateX(-18px) rotate(-2.5deg); }
    }
    @keyframes brambleSniff {
      0%,75%,100% { transform: translateY(0) rotate(0deg); }
      80%  { transform: translateY(7px) rotate(10deg); }
      88%  { transform: translateY(0) rotate(0deg); }
    }

    /* ── Pippin (mouse) — quick scurry ── */
    .anim-pippin { animation: pippinScurry 8s ease-in-out infinite; }
    @keyframes pippinScurry {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(24px) rotate(3deg); }
      22%     { transform: translateX(24px) rotate(-2deg); }
      24%     { transform: translateX(24px) rotate(0deg); }
      60%     { transform: translateX(-20px) rotate(-3deg); }
      62%     { transform: translateX(-20px) rotate(2deg); }
      64%     { transform: translateX(-20px) rotate(0deg); }
    }

    /* ── Fern (fawn) — graze & head raise ── */
    .anim-fern { animation: fernGraze 6s ease-in-out infinite; }
    @keyframes fernGraze {
      0%,100% { transform: translateY(0) rotate(0deg); }
      30%     { transform: translateY(10px) rotate(14deg); }
      55%     { transform: translateY(0) rotate(0deg); }
      70%     { transform: translateY(-6px) rotate(-3deg); }
      80%     { transform: translateY(0) rotate(0deg); }
    }

    /* ── Thistle (rare bunny) — proud pose ── */
    .anim-thistle { animation: thistlePose 7s ease-in-out infinite; }
    @keyframes thistlePose {
      0%,100% { transform: translateY(0) scale(1); }
      40%     { transform: translateY(-12px) scale(1.04); }
      55%     { transform: translateY(-12px) scale(1.04) rotate(3deg); }
      70%     { transform: translateY(0) scale(1); }
    }

    /* ── Cobble (rare hedgehog) — peek from ground ── */
    .anim-cobble { animation: cobblePeek 9s ease-in-out infinite; }
    @keyframes cobblePeek {
      0%,100% { transform: translateY(22px); opacity: 0.25; }
      12%,55% { transform: translateY(0); opacity: 1; }
      18%     { transform: translateY(0) rotate(-8deg); }
      24%     { transform: translateY(0) rotate(7deg); }
      30%,52% { transform: translateY(0) rotate(0deg); }
      68%     { transform: translateY(22px); opacity: 0.25; }
    }

    /* ── Shimmer (rare mouse) — ethereal float ── */
    .anim-shimmer {
      animation: shimmerFloat 3.2s ease-in-out infinite;
      filter: drop-shadow(0 0 10px rgba(173,255,243,0.55));
    }
    .anim-shimmer img { animation: shimmerGlow 2.1s ease-in-out infinite; }
    @keyframes shimmerFloat {
      0%,100% { transform: translateY(0); filter: drop-shadow(0 0 10px rgba(173,255,243,0.55)); }
      50%     { transform: translateY(-16px); filter: drop-shadow(0 0 22px rgba(173,255,243,0.95)); }
    }
    @keyframes shimmerGlow {
      0%,100% { opacity: 0.82; }
      50%     { opacity: 1; }
    }

    /* ── Soleil (rare fawn) — golden shimmer ── */
    .anim-soleil {
      animation: soleilFloat 4s ease-in-out infinite;
      filter: drop-shadow(0 0 14px rgba(255,213,80,0.6));
    }
    @keyframes soleilFloat {
      0%,100% { transform: translateY(0) rotate(0deg); filter: drop-shadow(0 0 14px rgba(255,213,80,0.6)); }
      50%     { transform: translateY(-14px) rotate(2deg); filter: drop-shadow(0 0 26px rgba(255,213,80,1)); }
    }

    /* ── Mist (rare hedgehog) — misty drift ── */
    .anim-mist {
      animation: mistDrift 5s ease-in-out infinite;
      filter: drop-shadow(0 0 12px rgba(180,220,255,0.6));
    }
    @keyframes mistDrift {
      0%,100% { transform: translateX(0) translateY(0); opacity: 0.9; }
      33%     { transform: translateX(14px) translateY(-8px); opacity: 1; }
      66%     { transform: translateX(-10px) translateY(-4px); opacity: 0.85; }
    }

    /* ── Aurora (legendary) — celestial presence ── */
    .anim-aurora {
      animation: auroraPresence 4s ease-in-out infinite;
      filter: drop-shadow(0 0 20px rgba(200,180,255,0.8));
    }
    @keyframes auroraPresence {
      0%,100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 20px rgba(200,180,255,0.8)); }
      50%     { transform: translateY(-18px) scale(1.05); filter: drop-shadow(0 0 36px rgba(200,180,255,1)); }
    }

    /* ── Tap reaction ── */
    .animal-tapped {
      animation: animalTap 0.45s cubic-bezier(.18,.9,.2,1.4) forwards !important;
    }
    @keyframes animalTap {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.3) translateY(-12px); }
      70%  { transform: scale(0.91); }
      100% { transform: scale(1); }
    }

    /* ── Heart particle ── */
    .animal-heart {
      position: absolute;
      font-size: 18px;
      pointer-events: none;
      animation: heartRise 1.1s ease-out forwards;
      z-index: 30;
    }
    @keyframes heartRise {
      0%   { opacity: 1; transform: translateY(0) scale(0.6); }
      60%  { opacity: 1; transform: translateY(-44px) scale(1.15); }
      100% { opacity: 0; transform: translateY(-76px) scale(0.8); }
    }

    /* ── Combo pop ── */
    .combo-pop { animation: comboPop 0.32s cubic-bezier(.18,.9,.2,1.3) both !important; }
    @keyframes comboPop {
      0%   { transform: scale(1); }
      55%  { transform: scale(1.22); }
      100% { transform: scale(1); }
    }

    /* ── Combo edge pulse ── */
    .combo-edge-pulse::before {
      content: '';
      position: fixed;
      inset: 0;
      border: 4px solid rgba(255,213,80,0.7);
      border-radius: 0;
      animation: edgePulse 0.5s ease forwards;
      pointer-events: none;
      z-index: 50;
    }
    @keyframes edgePulse {
      0%   { opacity: 0.9; }
      100% { opacity: 0; }
    }

    /* ── Power FX overlay ── */
    .power-fx-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pfx-banner {
      padding: 16px 32px;
      border-radius: 999px;
      background: rgba(8,16,24,0.82);
      border: 2px solid var(--pfx-color, #ffd68b);
      color: var(--pfx-color, #ffd68b);
      font-size: clamp(20px, 5vw, 32px);
      font-weight: 700;
      letter-spacing: 0.06em;
      opacity: 0;
      transform: scale(0.8);
      box-shadow: 0 0 40px var(--pfx-color, #ffd68b);
    }
    .pfx-active .pfx-banner {
      animation: pfxPop 0.9s cubic-bezier(.18,.9,.2,1.2) forwards;
    }
    @keyframes pfxPop {
      0%   { opacity: 0; transform: scale(0.7); }
      20%  { opacity: 1; transform: scale(1.08); }
      55%  { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.9) translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
}
