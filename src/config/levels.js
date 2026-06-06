import { EGG_TYPES } from './assets.js';

const eggCycle = Object.keys(EGG_TYPES);

function levelConfig(level, overrides = {}) {
  const colorCount = level <= 4 ? 4 : level <= 10 ? 5 : 6;
  const targetScore = overrides.targetScore ?? 1200 + level * 450;
  const base = {
    level,
    worldKey: 'cloverfield_meadow',
    worldName: 'Cloverfield Meadow',
    board: { columns: 7, rows: 9 },
    moves: Math.max(16, 26 - Math.floor(level / 2)),
    targetScore,
    colorCount,
    eggPool: eggCycle.slice(0, colorCount),
    obstacleProfile: { locked: 0, stone: 0, vines: 0 },
    objectives: [{ type: 'score', target: targetScore, label: `Reach ${targetScore} score` }],
    reward: { paws: 80 + level * 18, acorns: level % 5 === 0 ? 12 : 6, fragmentEggKey: eggCycle[(level - 1) % eggCycle.length], fragmentAmount: level % 5 === 0 ? 2 : 1 },
    hidden: { revisit1: 'Decoration Fragment', revisit3: 'Rare Fragment Chance', revisit5: 'Lore Piece', revisit10: 'Veteran Stamp' },
    flavor: 'Golden meadow winds carry warm sparkle trails across the board.',
    ...overrides,
  };
  if (!base.objectives.some((item) => item.type === 'score')) {
    base.objectives.unshift({ type: 'score', target: base.targetScore, label: `Reach ${base.targetScore} score` });
  }
  return base;
}

export const levels = [
  levelConfig(1, { moves: 24, targetScore: 1200, colorCount: 4, eggPool: eggCycle.slice(0, 4), reward: { paws: 90, acorns: 8, fragmentEggKey: 'clover', fragmentAmount: 1 } }),
  levelConfig(2, { moves: 23, targetScore: 1650, colorCount: 4, eggPool: eggCycle.slice(0, 4), reward: { paws: 110, acorns: 8, fragmentEggKey: 'clover', fragmentAmount: 1 } }),
  levelConfig(3, { moves: 22, targetScore: 2100, colorCount: 4, eggPool: eggCycle.slice(0, 4), reward: { paws: 130, acorns: 8, fragmentEggKey: 'mossy', fragmentAmount: 1 } }),
  levelConfig(4, { moves: 22, targetScore: 2550, colorCount: 4, eggPool: eggCycle.slice(0, 4), reward: { paws: 145, acorns: 9, fragmentEggKey: 'mossy', fragmentAmount: 1 } }),
  levelConfig(5, { moves: 21, targetScore: 3000, colorCount: 4, eggPool: eggCycle.slice(0, 4), objectives: [{ type: 'score', target: 3000, label: 'Reach 3000 score' }, { type: 'hatch', target: 12, label: 'Hatch 12 eggs' }], reward: { paws: 160, acorns: 10, fragmentEggKey: 'clover', fragmentAmount: 2 } }),
  levelConfig(6, { moves: 21, targetScore: 3450, colorCount: 5, obstacleProfile: { locked: 5, stone: 0, vines: 0 }, flavor: 'Locked eggs arrive with tiny silver clasps.' }),
  levelConfig(7, { moves: 20, targetScore: 3900, colorCount: 5, obstacleProfile: { locked: 7, stone: 0, vines: 0 }, objectives: [{ type: 'score', target: 3900, label: 'Reach 3900 score' }, { type: 'obstacle', target: 5, label: 'Break 5 locked eggs' }] }),
  levelConfig(8, { moves: 20, targetScore: 4400, colorCount: 5, obstacleProfile: { locked: 8, stone: 0, vines: 0 }, reward: { paws: 225, acorns: 10, fragmentEggKey: 'pearl', fragmentAmount: 1 } }),
  levelConfig(9, { moves: 19, targetScore: 4900, colorCount: 5, obstacleProfile: { locked: 9, stone: 0, vines: 0 }, objectives: [{ type: 'score', target: 4900, label: 'Reach 4900 score' }, { type: 'hatch', target: 16, label: 'Hatch 16 eggs' }] }),
  levelConfig(10, { moves: 19, targetScore: 5500, colorCount: 5, obstacleProfile: { locked: 10, stone: 0, vines: 0 }, reward: { paws: 260, acorns: 12, fragmentEggKey: 'amethyst', fragmentAmount: 2 }, flavor: 'A violet glimmer hints that Thistle is near.' }),
  levelConfig(11, { moves: 19, targetScore: 6100, colorCount: 6, obstacleProfile: { locked: 6, stone: 4, vines: 0 }, flavor: 'Stone eggs anchor the first hard wall.' }),
  levelConfig(12, { moves: 18, targetScore: 6700, colorCount: 6, obstacleProfile: { locked: 6, stone: 6, vines: 0 }, objectives: [{ type: 'score', target: 6700, label: 'Reach 6700 score' }, { type: 'obstacle', target: 8, label: 'Shatter 8 stone eggs' }] }),
  levelConfig(13, { moves: 18, targetScore: 7300, colorCount: 6, obstacleProfile: { locked: 7, stone: 7, vines: 0 }, reward: { paws: 310, acorns: 12, fragmentEggKey: 'pearl', fragmentAmount: 1 } }),
  levelConfig(14, { moves: 17, targetScore: 8000, colorCount: 6, obstacleProfile: { locked: 8, stone: 8, vines: 0 }, objectives: [{ type: 'score', target: 8000, label: 'Reach 8000 score' }, { type: 'hatch', target: 20, label: 'Hatch 20 eggs' }] }),
  levelConfig(15, { moves: 17, targetScore: 8700, colorCount: 6, obstacleProfile: { locked: 8, stone: 10, vines: 0 }, reward: { paws: 360, acorns: 14, fragmentEggKey: 'sunburst', fragmentAmount: 2 }, flavor: 'Cobble watches from under the mushroom arch.' }),
  levelConfig(16, { moves: 17, targetScore: 9500, colorCount: 6, obstacleProfile: { locked: 8, stone: 8, vines: 8 }, flavor: 'Layered meadow vines wrap around the board.' }),
  levelConfig(17, { moves: 16, targetScore: 10300, colorCount: 6, obstacleProfile: { locked: 9, stone: 9, vines: 10 }, objectives: [{ type: 'score', target: 10300, label: 'Reach 10300 score' }, { type: 'obstacle', target: 10, label: 'Clear 10 vine layers' }] }),
  levelConfig(18, { moves: 16, targetScore: 11100, colorCount: 6, obstacleProfile: { locked: 10, stone: 10, vines: 12 }, reward: { paws: 420, acorns: 14, fragmentEggKey: 'rosy', fragmentAmount: 1 } }),
  levelConfig(19, { moves: 15, targetScore: 11900, colorCount: 6, obstacleProfile: { locked: 10, stone: 10, vines: 14 }, objectives: [{ type: 'score', target: 11900, label: 'Reach 11900 score' }, { type: 'hatch', target: 24, label: 'Hatch 24 eggs' }] }),
  levelConfig(20, { moves: 15, targetScore: 12800, colorCount: 6, obstacleProfile: { locked: 12, stone: 12, vines: 16 }, reward: { paws: 500, acorns: 16, fragmentEggKey: 'sunburst', fragmentAmount: 2 }, flavor: 'Soleil\'s halo warms every blast.' }),
  levelConfig(21, { moves: 15, targetScore: 13700, colorCount: 6, obstacleProfile: { locked: 10, stone: 12, vines: 18 }, objectives: [{ type: 'score', target: 13700, label: 'Reach 13700 score' }, { type: 'obstacle', target: 12, label: 'Break 12 layered obstacles' }, { type: 'hatch', target: 20, label: 'Hatch 20 eggs' }] }),
  levelConfig(22, { moves: 14, targetScore: 14600, colorCount: 6, obstacleProfile: { locked: 10, stone: 14, vines: 18 }, reward: { paws: 580, acorns: 16, fragmentEggKey: 'amethyst', fragmentAmount: 1 } }),
  levelConfig(23, { moves: 14, targetScore: 15600, colorCount: 6, obstacleProfile: { locked: 12, stone: 14, vines: 20 }, objectives: [{ type: 'score', target: 15600, label: 'Reach 15600 score' }, { type: 'obstacle', target: 14, label: 'Shatter 14 tough eggs' }] }),
  levelConfig(24, { moves: 13, targetScore: 16600, colorCount: 6, obstacleProfile: { locked: 12, stone: 16, vines: 20 }, reward: { paws: 660, acorns: 18, fragmentEggKey: 'rosy', fragmentAmount: 1 } }),
  levelConfig(25, { moves: 13, targetScore: 17750, colorCount: 6, obstacleProfile: { locked: 14, stone: 16, vines: 22 }, objectives: [{ type: 'score', target: 17750, label: 'Reach 17750 score' }, { type: 'obstacle', target: 16, label: 'Clear 16 obstacles' }, { type: 'hatch', target: 26, label: 'Hatch 26 eggs' }], reward: { paws: 800, acorns: 24, fragmentEggKey: 'sunburst', fragmentAmount: 2 }, flavor: 'The final meadow gate glows with Materia light.' }),
];

export const getLevelByNumber = (levelNumber) => levels.find((level) => level.level === levelNumber) ?? levels[0];
