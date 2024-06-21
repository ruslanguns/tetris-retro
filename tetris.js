const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const SCALE = 20;
const ROWS = 20;
const COLUMNS = 12;

context.scale(SCALE, SCALE);

const board = createMatrix(COLUMNS, ROWS);

let piece;
const PIECES = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 2, 0],
    [2, 2, 2],
  ],
  [
    [0, 3, 3],
    [3, 3, 0],
  ],
  [
    [4, 4, 0],
    [0, 4, 4],
  ],
  [[5, 5, 5, 5]],
  [
    [6, 6, 6],
    [0, 6, 0],
  ],
  [
    [7, 7, 7],
    [7, 0, 0],
  ],
];

const COLORS = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF",
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece() {
  const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    position: {
      x: Math.floor(COLUMNS / 2) - Math.floor(piece[0].length / 2),
      y: 0,
    },
    matrix: piece,
  };
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = COLORS[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(piece.matrix, piece.position);
}

function collide(board, piece) {
  const [m, o] = [piece.matrix, piece.position];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function movePiece(dir) {
  piece.position.x += dir;
  if (collide(board, piece)) {
    piece.position.x -= dir;
  }
}

function rotatePiece() {
  const rotated = piece.matrix[0].map((val, index) =>
    piece.matrix.map((row) => row[index]).reverse()
  );
  const prevX = piece.position.x;
  piece.matrix = rotated;

  if (collide(board, piece)) {
    piece.position.x = prevX;
    piece.matrix = piece.matrix[0].map((val, index) =>
      piece.matrix.map((row) => row[row.length - 1 - index])
    );
  }
}

function pieceDrop() {
  piece.position.y++;
  if (collide(board, piece)) {
    piece.position.y--;
    mergePiece();
    piece = createPiece();
    if (collide(board, piece)) {
      gameOver();
    }
  }
  dropCounter = 0;
}

function removeCompleteRows() {
  let rowsCleared = 0;
  outer: for (let y = board.length - 1; y >= 0; --y) {
    for (let x = 0; x < board[y].length; ++x) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }

    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    ++y;
    ++rowsCleared;
  }

  return rowsCleared;
}

function mergePiece() {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + piece.position.y][x + piece.position.x] = value;
      }
    });
  });
  const rowsCleared = removeCompleteRows();
  updateScore(rowsCleared);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;

function startGame() {
  board.forEach((row) => row.fill(0));
  score = 0;
  updateScore(0);
  isGameOver = true;
  isPaused = true;
  piece = createPiece();
  dropInterval = 1000;
  showMessage("TETRIS\nPress Enter to start");
}

function showMessage(message) {
  const overlay = document.getElementById("message-overlay");
  const content = document.getElementById("message-content");
  content.textContent = message;
  overlay.classList.remove("hidden");
}

function hideMessage() {
  const overlay = document.getElementById("message-overlay");
  overlay.classList.add("hidden");
}

function updateScore(rowsCleared) {
  const points = [0, 40, 100, 300, 1200];
  score += points[rowsCleared];
  document.getElementById("score").textContent = score;
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    showMessage("PAUSED\nPress P to resume");
  } else {
    hideMessage();
    lastTime = 0;
    gameLoop();
  }
}

function gameLoop(time = 0) {
  if (isPaused || isGameOver) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    pieceDrop();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isGameOver = true;
  showMessage("GAME OVER\nPress Enter to restart");
}

function clearBoard() {
  board.forEach((row) => row.fill(0));
  document.getElementById("score").textContent = 0;
}

document.addEventListener("keydown", (event) => {
  if (isGameOver) {
    if (event.key === "Enter") {
      clearBoard(board);
      hideMessage();
      isGameOver = false;
      isPaused = false;
      piece = createPiece();
      gameLoop();
    }
    return;
  }
  if (event.key === "p" || event.key === "P") {
    togglePause();
    return;
  }

  if (isPaused) return;

  switch (event.key) {
    case "ArrowLeft":
      movePiece(-1);
      break;
    case "ArrowRight":
      movePiece(1);
      break;
    case "ArrowDown":
      pieceDrop();
      break;
    case "ArrowUp":
      rotatePiece();
      break;
  }
});

startGame();
