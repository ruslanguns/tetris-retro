const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const SCALE = 20;
const ROWS = 20;
const COLUMNS = 12;

context.scale(SCALE, SCALE);

// Matriz para representar el tablero
const board = createMatrix(COLUMNS, ROWS);

// Pieza actual
let piece;

// Piezas de Tetris
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

// Crear matriz
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Crear nueva pieza
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

// Dibujar matriz
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

// Función principal de dibujo
function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(piece.matrix, piece.position);
}

// Colisión
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

// Mover pieza
function movePiece(dir) {
  piece.position.x += dir;
  if (collide(board, piece)) {
    piece.position.x -= dir;
  }
}

// Rotar pieza
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

// Caída de la pieza
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

// Función para eliminar filas completas
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

// Fusionar pieza con el tablero
function mergePiece() {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + piece.position.y][x + piece.position.x] = value;
      }
    });
  });
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;

// Función para iniciar/reiniciar el juego
function startGame() {
  board.forEach((row) => row.fill(0));
  score = 0;
  isGameOver = false;
  isPaused = false;
  piece = createPiece();
  dropInterval = 1000;
  gameLoop();
}

function updateScore(rowsCleared) {
  const points = [0, 40, 100, 300, 1200];
  score += points[rowsCleared];
  document.getElementById("score").textContent = score;
}

// Función para pausar/reanudar el juego
function togglePause() {
  isPaused = !isPaused;
  document.getElementById("game-status").textContent = isPaused ? "Paused" : "";
  if (!isPaused) {
    lastTime = 0;
    gameLoop();
  }
}

// Bucle del juego
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

// Función de Game Over
function gameOver() {
  isGameOver = true;
  document.getElementById("game-status").textContent =
    "Game Over! Press Enter to restart";
}

// Controles del teclado
document.addEventListener("keydown", (event) => {
  if (isGameOver) {
    if (event.keyCode === 13) {
      // Enter para reiniciar
      startGame();
    }
    return;
  }

  if (event.keyCode === 80) {
    // 'P' para pausar/reanudar
    togglePause();
    return;
  }

  if (isPaused) return;

  if (event.keyCode === 37) {
    movePiece(-1);
  } else if (event.keyCode === 39) {
    movePiece(1);
  } else if (event.keyCode === 40) {
    pieceDrop();
  } else if (event.keyCode === 38) {
    rotatePiece();
  }
});

// // Iniciar el juego
// piece = createPiece();
// gameLoop();
startGame();
