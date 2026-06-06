import { ANIMALS, BUILDINGS, COLLECTION_ORDER, RARE_ANIMAL_ORDER, SKINS, WEATHER_STATES } from '../config/assets.js';

const STORAGE_KEY = 'paw-a-dise-save-v1';

function todayIso() { return new Date().toISOString(); }

function createDefaultAnimalProfiles() {
  return COLLECTION_ORDER.reduce((acc, id) => {
    acc[id] = { found: false, foundAt: null, levelFound: null, timesVisitedVillage: 0, inVillage: false };
    return acc;
  }, {});
}

function defaultSave() {
  return {
    playerName: 'Keeper', paws: 320, acorns: 99, highestUnlockedLevel: 1,
    selectedSkin: SKINS.jewel.key, unlockedSkins: { jewel: true, materia: false },
    inventory: { pawSwipe: 0, vineBurst: 0, rainbowEgg: 0, nestSpin: 2, dewdropFreeze: 1, grandHatch: 1 },
    fragments: { clover: 0, amethyst: 0, mossy: 0, pearl: 0, sunburst: 0, rosy: 0, aurora: 0 },
    levelResults: {},
    village: { visits: 0, weatherIndex: 0, buildingsOwned: ['clover_burrow'], returnBonusSeed: 0, lastVisitAt: null, loreUnlocked: [] },
    animalProfiles: createDefaultAnimalProfiles(),
    settings: { sound: true, music: true, haptics: true },
    stats: { totalLevelsCleared: 0, noPowerWins: 0, goldWins: 0, silverOrBetterWins: 0, totalEggsHatched: 0, totalVillageBuilds: 0, lastAuroraRevealAt: null },
    auroraFragmentLevels: {}, dailyStreak: 7,
  };
}

function sanitizeSave(raw) {
  const base = defaultSave();
  return {
    ...base, ...raw,
    unlockedSkins: { ...base.unlockedSkins, ...(raw?.unlockedSkins ?? {}) },
    inventory: { ...base.inventory, ...(raw?.inventory ?? {}) },
    fragments: { ...base.fragments, ...(raw?.fragments ?? {}) },
    village: { ...base.village, ...(raw?.village ?? {}), buildingsOwned: Array.from(new Set(raw?.village?.buildingsOwned ?? base.village.buildingsOwned)), loreUnlocked: Array.from(new Set(raw?.village?.loreUnlocked ?? base.village.loreUnlocked)) },
    animalProfiles: { ...base.animalProfiles, ...(raw?.animalProfiles ?? {}) },
    settings: { ...base.settings, ...(raw?.settings ?? {}) },
    stats: { ...base.stats, ...(raw?.stats ?? {}) },
    levelResults: raw?.levelResults ?? base.levelResults,
    auroraFragmentLevels: raw?.auroraFragmentLevels ?? base.auroraFragmentLevels,
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return sanitizeSave(raw ? JSON.parse(raw) : defaultSave());
  } catch (error) {
    console.warn('Failed to load save. Resetting.', error);
    const fallback = defaultSave();
    persistSave(fallback);
    return fallback;
  }
}

export function persistSave(save) { localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeSave(save))); }
export function updateSettings(save, patch) { const next = sanitizeSave({ ...save, settings: { ...save.settings, ...patch } }); persistSave(next); return next; }
export function renamePlayer(save, playerName) { const next = sanitizeSave({ ...save, playerName: playerName?.trim() || 'Keeper' }); persistSave(next); return next; }
export function addCurrencies(save, { paws = 0, acorns = 0 } = {}) { const next = sanitizeSave({ ...save, paws: Math.max(0, (save.paws ?? 0) + paws), acorns: Math.max(0, (save.acorns ?? 0) + acorns) }); persistSave(next); return next; }
export function spendCurrencies(save, { paws = 0, acorns = 0 } = {}) { if ((save.paws ?? 0) < paws || (save.acorns ?? 0) < acorns) return null; const next = sanitizeSave({ ...save, paws: Math.max(0, save.paws - paws), acorns: Math.max(0, save.acorns - acorns) }); persistSave(next); return next; }
export function addInventory(save, rewards = {}) { const inventory = { ...save.inventory }; Object.entries(rewards).forEach(([key, amount]) => { inventory[key] = Math.max(0, (inventory[key] ?? 0) + amount); }); const next = sanitizeSave({ ...save, inventory }); persistSave(next); return next; }
export function consumeInventory(save, key, amount = 1) { if ((save.inventory?.[key] ?? 0) < amount) return null; const next = sanitizeSave({ ...save, inventory: { ...save.inventory, [key]: Math.max(0, (save.inventory[key] ?? 0) - amount) } }); persistSave(next); return next; }
export function addFragments(save, rewards = {}) { const fragments = { ...save.fragments }; Object.entries(rewards).forEach(([key, amount]) => { fragments[key] = Math.max(0, (fragments[key] ?? 0) + amount); }); const next = sanitizeSave({ ...save, fragments }); persistSave(next); return next; }
export function getLevelResult(save, levelNumber) { return save.levelResults?.[levelNumber] ?? { bestScore: 0, stars: 0, revisits: 0, completed: false, veteran: false, loreUnlocked: false, revisitRewardsClaimed: [], auroraFragmentFound: false }; }

export function recordLevelOutcome(save, levelNumber, { score, stars, movesUsed, usedPowerUp } = {}) {
  const current = getLevelResult(save, levelNumber);
  const firstCompletion = !current.completed;
  const revisits = firstCompletion ? 0 : (current.revisits ?? 0) + 1;
  const nextResult = { ...current, completed: true, bestScore: Math.max(current.bestScore ?? 0, score ?? 0), stars: Math.max(current.stars ?? 0, stars ?? 0), revisits, movesUsed: movesUsed ?? current.movesUsed ?? 0, lastCompletedAt: todayIso() };
  if (revisits >= 10) nextResult.veteran = true;
  if (revisits >= 5) nextResult.loreUnlocked = true;
  const next = sanitizeSave({ ...save, highestUnlockedLevel: Math.max(save.highestUnlockedLevel ?? 1, Math.min(25, levelNumber + 1)), levelResults: { ...save.levelResults, [levelNumber]: nextResult }, stats: { ...save.stats, totalLevelsCleared: (save.stats?.totalLevelsCleared ?? 0) + 1, noPowerWins: (save.stats?.noPowerWins ?? 0) + (usedPowerUp ? 0 : 1), goldWins: (save.stats?.goldWins ?? 0) + (stars >= 3 ? 1 : 0), silverOrBetterWins: (save.stats?.silverOrBetterWins ?? 0) + (stars >= 2 ? 1 : 0) } });
  persistSave(next); return next;
}

export function markAuroraFragmentLevel(save, levelNumber) {
  if (save.auroraFragmentLevels?.[levelNumber]) return save;
  const currentResult = getLevelResult(save, levelNumber);
  const next = sanitizeSave({ ...save, auroraFragmentLevels: { ...save.auroraFragmentLevels, [levelNumber]: true }, fragments: { ...save.fragments, aurora: (save.fragments?.aurora ?? 0) + 1 }, levelResults: { ...save.levelResults, [levelNumber]: { ...currentResult, auroraFragmentFound: true } } });
  persistSave(next); return next;
}

export function unlockAnimal(save, animalId, levelNumber = null) {
  const animal = ANIMALS[animalId];
  if (!animal) return save;
  const current = save.animalProfiles?.[animalId] ?? {};
  if (current.found) return save;
  const profile = { ...current, found: true, foundAt: todayIso(), levelFound: levelNumber, timesVisitedVillage: current.timesVisitedVillage ?? 0, inVillage: true };
  const next = sanitizeSave({ ...save, animalProfiles: { ...save.animalProfiles, [animalId]: profile }, stats: { ...save.stats, totalEggsHatched: (save.stats?.totalEggsHatched ?? 0) + 1 } });
  persistSave(next); return next;
}

export function setAnimalVillageState(save, animalId, inVillage) {
  const current = save.animalProfiles?.[animalId];
  if (!current?.found) return save;
  const next = sanitizeSave({ ...save, animalProfiles: { ...save.animalProfiles, [animalId]: { ...current, inVillage } } });
  persistSave(next); return next;
}

export function visitVillage(save) {
  const weatherIndex = ((save.village?.weatherIndex ?? 0) + 1) % WEATHER_STATES.length;
  const updatedProfiles = { ...save.animalProfiles };
  Object.entries(updatedProfiles).forEach(([id, profile]) => {
    if (profile?.found && profile.inVillage) updatedProfiles[id] = { ...profile, timesVisitedVillage: (profile.timesVisitedVillage ?? 0) + 1 };
  });
  const next = sanitizeSave({ ...save, animalProfiles: updatedProfiles, village: { ...save.village, visits: (save.village?.visits ?? 0) + 1, weatherIndex, returnBonusSeed: 1, lastVisitAt: todayIso() } });
  persistSave(next); return next;
}

export function buildVillageStructure(save, buildingId) {
  const building = BUILDINGS.find((entry) => entry.id === buildingId);
  if (!building) return null;
  if (save.village?.buildingsOwned?.includes(buildingId)) return save;
  if ((save.paws ?? 0) < building.cost) return null;
  const next = sanitizeSave({ ...save, paws: save.paws - building.cost, village: { ...save.village, buildingsOwned: [...(save.village?.buildingsOwned ?? []), buildingId] }, stats: { ...save.stats, totalVillageBuilds: (save.stats?.totalVillageBuilds ?? 0) + 1 } });
  persistSave(next); return next;
}

export function unlockMateriaSkin(save) {
  if (save.unlockedSkins?.materia) return save;
  const next = sanitizeSave({ ...save, unlockedSkins: { ...save.unlockedSkins, materia: true } });
  persistSave(next); return next;
}

export function selectSkin(save, skinKey) {
  if (!save.unlockedSkins?.[skinKey]) return save;
  const next = sanitizeSave({ ...save, selectedSkin: skinKey });
  persistSave(next); return next;
}

export function getVillageWeather(save) { return WEATHER_STATES[save.village?.weatherIndex ?? 0] ?? WEATHER_STATES[0]; }
export function countFoundAnimals(save) { return Object.values(save.animalProfiles ?? {}).filter((p) => p?.found).length; }
export function countVillageAnimals(save) { return Object.values(save.animalProfiles ?? {}).filter((p) => p?.found && p.inVillage).length; }
export function getRareAnimalsFound(save) { return RARE_ANIMAL_ORDER.filter((id) => save.animalProfiles?.[id]?.found); }
export function allRaresFound(save) { return getRareAnimalsFound(save).length === RARE_ANIMAL_ORDER.length; }
export function canUnlockAnimal(save, animalId) { return !!save.animalProfiles?.[animalId]?.found; }
