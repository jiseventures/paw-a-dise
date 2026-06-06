import { EGG_TYPES } from '../config/assets.js';

export const BOARD_COLUMNS = 7;
export const BOARD_ROWS = 9;

let cellIdCounter = 1;

const obstacleHitMap = {
  locked: 1,
  stone: 2,
  vine: 2,
};

function nextCellId() {
  cellIdCounter += 1;
  return `egg_${cellIdCounter}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createCell(eggKey, obstacleType = null) {
  return {
    id: nextCellId(),
    eggKey,
    obstacleType,
    obstacleHits: obstacleType ? obstacleHitMap[obstacleType] : 0,
  };
}

export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function getEggPool(level) {
  const allEggs = level.eggPool?.length ? level.eggPool : Object.keys(EGG_TYPES);
  return allEggs.slice(0, Math.min(allEggs.length, level.colorCount ?? allEggs.length));
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLUMNS }, () => null));
}

function fillBoardRandomly(level) {
  const pool = getEggPool(level);
  const board = createEmptyBoard();
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      board[row][col] = createCell(randomItem(pool));
    }
  }
  return board;
}

function randomFreePositions(count, skip = new Set()) {
  const positions = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      const key = `${row},${col}`;
      if (!skip.has(key)) positions.push({ row, col, key });
    }
  }
  positions.sort(() => Math.random() - 0.5);
  return positions.slice(0, count);
}

function applyInitialObstacles(board, level) {
  const next = cloneBoard(board);
  const used = new Set();
  const { locked = 0, stone = 0, vines = 0 } = level.obstacleProfile ?? {};

  randomFreePositions(locked, used).forEach(({ row, col, key }) => {
    used.add(key);
    next[row][col].obstacleType = 'locked';
    next[row][col].obstacleHits = obstacleHitMap.locked;
  });

  randomFreePositions(stone, used).forEach(({ row, col, key }) => {
    used.add(key);
    next[row][col].obstacleType = 'stone';
    next[row][col].obstacleHits = obstacleHitMap.stone;
  });

  randomFreePositions(vines, used).forEach(({ row, col, key }) => {
    used.add(key);
    next[row][col].obstacleType = 'vine';
    next[row][col].obstacleHits = obstacleHitMap.vine;
  });

  return next;
}

export function getCluster(board, startRow, startCol) {
  const start = board?.[startRow]?.[startCol];
  if (!start) return [];
  const visited = new Set();
  const stack = [[startRow, startCol]];
  const cluster = [];
  while (stack.length) {
    const [row, col] = stack.pop();
    const key = `${row},${col}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const cell = board?.[row]?.[col];
    if (!cell || cell.eggKey !== start.eggKey) continue;
    cluster.push({ row, col, cell });
    stack.push([row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]);
  }
  return cluster;
}

export function hasValidMove(board) {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      if (getCluster(board, row, col).length >= 2) return true;
    }
  }
  return false;
}

export function generateBoard(level) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    const raw = fillBoardRandomly(level);
    const board = applyInitialObstacles(raw, level);
    if (hasValidMove(board)) return board;
  }
  return applyInitialObstacles(fillBoardRandomly(level), level);
}

export function createPositionMap(board) {
  const map = new Map();
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      const cell = board[row][col];
      if (cell) map.set(cell.id, { row, col });
    }
  }
  return map;
}

export function getRowCells(board, rowIndex) {
  return board[rowIndex].map((cell, col) => ({ row: rowIndex, col, cell })).filter(({ cell }) => !!cell);
}

export function getColumnCells(board, columnIndex) {
  const cells = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    const cell = board[row][columnIndex];
    if (cell) cells.push({ row, col: columnIndex, cell });
  }
  return cells;
}

export function getCrossCells(board, row, col) {
  const map = new Map();
  [...getRowCells(board, row), ...getColumnCells(board, col)].forEach((entry) => {
    map.set(`${entry.row},${entry.col}`, entry);
  });
  return Array.from(map.values());
}

export function getAreaCells(board, centerRow, centerCol, radius = 1) {
  const cells = [];
  for (let row = centerRow - radius; row <= centerRow + radius; row += 1) {
    for (let col = centerCol - radius; col <= centerCol + radius; col += 1) {
      if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLUMNS) continue;
      const cell = board[row][col];
      if (cell) cells.push({ row, col, cell });
    }
  }
  return cells;
}

export function getColorCells(board, eggKey) {
  const cells = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      const cell = board[row][col];
      if (cell?.eggKey === eggKey) cells.push({ row, col, cell });
    }
  }
  return cells;
}

export function getAllCells(board) {
  const cells = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      const cell = board[row][col];
      if (cell) cells.push({ row, col, cell });
    }
  }
  return cells;
}

export function pickRandomEggKey(level) {
  return randomItem(getEggPool(level));
}

function removeDuplicateTargets(cells) {
  const map = new Map();
  cells.forEach((entry) => { map.set(`${entry.row},${entry.col}`, entry); });
  return Array.from(map.values());
}

export function applyBlast(board, cells, level) {
  const next = cloneBoard(board);
  const targets = removeDuplicateTargets(cells);
  let removedCount = 0;
  let crackedCount = 0;
  let obstacleClears = 0;
  targets.forEach(({ row, col }) => {
    const cell = next[row]?.[col];
    if (!cell) return;
    if (cell.obstacleHits > 0) {
      cell.obstacleHits -= 1;
      crackedCount += 1;
      if (cell.obstacleHits <= 0) {
        cell.obstacleHits = 0;
        cell.obstacleType = null;
        obstacleClears += 1;
      }
      return;
    }
    next[row][col] = null;
    removedCount += 1;
  });
  const withGravity = applyGravityAndRefill(next, level);
  return { board: withGravity, removedCount, crackedCount, obstacleClears, targetedCount: targets.length };
}

export function applyGravityAndRefill(board, level) {
  const pool = getEggPool(level);
  const next = createEmptyBoard();
  for (let col = 0; col < BOARD_COLUMNS; col += 1) {
    const stack = [];
    for (let row = BOARD_ROWS - 1; row >= 0; row -= 1) {
      const cell = board[row][col];
      if (cell) stack.push({ ...cell });
    }
    for (let row = BOARD_ROWS - 1; row >= 0; row -= 1) {
      next[row][col] = stack.shift() ?? createCell(randomItem(pool));
    }
  }
  return next;
}

export function shuffleBoard(board, level) {
  const next = cloneBoard(board);
  const eggKeys = [];
  const obstacles = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      eggKeys.push(next[row][col].eggKey);
      obstacles.push({ obstacleType: next[row][col].obstacleType, obstacleHits: next[row][col].obstacleHits });
    }
  }
  for (let attempt = 0; attempt < 80; attempt += 1) {
    eggKeys.sort(() => Math.random() - 0.5);
    let index = 0;
    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLUMNS; col += 1) {
        next[row][col] = { id: nextCellId(), eggKey: eggKeys[index], obstacleType: obstacles[index].obstacleType, obstacleHits: obstacles[index].obstacleHits };
        index += 1;
      }
    }
    if (hasValidMove(next)) return cloneBoard(next);
  }
  return generateBoard(level);
}

export function growVines(board, level, count = 2) {
  const next = cloneBoard(board);
  const candidates = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      const cell = next[row][col];
      if (!cell) continue;
      if (cell.obstacleType === 'stone') continue;
      if (cell.obstacleType === 'vine' && cell.obstacleHits >= 3) continue;
      candidates.push({ row, col, cell });
    }
  }
  candidates.sort(() => Math.random() - 0.5);
  const touched = [];
  candidates.slice(0, count).forEach(({ row, col, cell }) => {
    if (cell.obstacleType === 'vine') {
      cell.obstacleHits = Math.min(3, cell.obstacleHits + 1);
    } else if (!cell.obstacleType) {
      cell.obstacleType = 'vine';
      cell.obstacleHits = obstacleHitMap.vine;
    } else if (cell.obstacleType === 'locked') {
      cell.obstacleType = 'vine';
      cell.obstacleHits = Math.max(obstacleHitMap.vine, cell.obstacleHits);
    }
    touched.push({ row, col, cell: { ...cell } });
  });
  return { board: next, touched };
}

export function countObstacleCells(board) {
  let total = 0;
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLUMNS; col += 1) {
      if (board[row][col]?.obstacleHits > 0) total += 1;
    }
  }
  return total;
}
