const boardSize = 8;
const shipLengths = [4, 3, 3, 2, 2];

const gameBoard = document.getElementById("game-board");
const hitsElement = document.getElementById("hits");
const missesElement = document.getElementById("misses");
const shipsElement = document.getElementById("ships");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restart");

let ships = [];
let shots = [];
let hits = 0;
let misses = 0;
let gameOver = false;

/* Crear tablero */

function createBoard() {
  gameBoard.textContent = "";

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement("button");

    cell.type = "button";
    cell.classList.add("cell", "water");

    cell.setAttribute("data-position", i);

    cell.addEventListener("click", shoot);

    gameBoard.appendChild(cell);
  }
}

/* Obtener fila */

function getRow(index) {
  return Math.floor(index / boardSize);
}

/* Obtener columna */

function getColumn(index) {
  return index % boardSize;
}

/* Obtener posición */

function getIndex(row, column) {
  return row * boardSize + column;
}

/* Comprobar si se puede colocar */

function canPlaceShip(row, column, length, horizontal) {
  const positions = [];

  for (let i = 0; i < length; i++) {
    let currentRow = row;
    let currentColumn = column;

    if (horizontal) {
      currentColumn += i;
    } else {
      currentRow += i;
    }

    if (currentRow >= boardSize || currentColumn >= boardSize) {
      return false;
    }

    const index = getIndex(currentRow, currentColumn);

    for (const ship of ships) {
      if (ship.positions.includes(index)) {
        return false;
      }
    }

    positions.push(index);
  }

  return true;
}

/* Colocar barcos */

function placeShips() {
  ships = [];

  for (const length of shipLengths) {
    let placed = false;

    while (!placed) {
      const row = Math.floor(Math.random() * boardSize);
      const column = Math.floor(Math.random() * boardSize);
      const horizontal = Math.random() < 0.5;

      if (canPlaceShip(row, column, length, horizontal)) {
        const positions = [];

        for (let i = 0; i < length; i++) {
          let currentRow = row;
          let currentColumn = column;

          if (horizontal) {
            currentColumn += i;
          } else {
            currentRow += i;
          }

          positions.push(getIndex(currentRow, currentColumn));
        }

        ships.push({
          positions: positions,
          hits: [],
        });

        placed = true;
      }
    }
  }
}

/* Disparo */

function shoot(event) {
  if (gameOver) {
    return;
  }

  const cell = event.currentTarget;
  const index = Number(cell.getAttribute("data-position"));

  if (shots.includes(index)) {
    return;
  }

  shots.push(index);

  cell.disabled = true;

  let hitShip = null;

  for (const ship of ships) {
    if (ship.positions.includes(index)) {
      hitShip = ship;
      break;
    }
  }

  /* Acierto */

  if (hitShip) {
    hits++;

    hitShip.hits.push(index);

    cell.classList.remove("water");
    cell.classList.add("hit");

    cell.innerHTML = '<i class="bi bi-rocket-takeoff-fill"></i>';

    messageElement.textContent = "¡Acierto! Has alcanzado un barco.";
  } else {
    /* Fallo */
    misses++;

    cell.classList.remove("water");
    cell.classList.add("miss");

    cell.innerHTML = '<i class="bi bi-droplet-fill"></i>';

    messageElement.textContent = "Agua. Has fallado.";
  }

  updateStats();

  checkGame();
}

/* Actualizar estadísticas */

function updateStats() {
  let discoveredShips = 0;

  for (const ship of ships) {
    if (ship.hits.length == ship.positions.length) {
      discoveredShips++;
    }
  }

  hitsElement.textContent = hits;
  missesElement.textContent = misses;

  shipsElement.textContent = discoveredShips + " / 5";
}

/* Comprobar victoria o derrota */

function checkGame() {
  let allShipsDiscovered = true;

  for (const ship of ships) {
    if (ship.hits.length != ship.positions.length) {
      allShipsDiscovered = false;
      break;
    }
  }

  /* Victoria */

  if (allShipsDiscovered) {
    gameOver = true;

    messageElement.textContent = "¡Victoria! Has hundido los 5 barcos.";

    revealShips();

    return;
  }

  /* Derrota */

  if (misses >= 10) {
    gameOver = true;

    messageElement.textContent = "Has perdido. Has llegado a 10 fallos.";

    revealShips();
  }
}

/* Mostrar barcos restantes */

function revealShips() {
  const cells = gameBoard.querySelectorAll(".cell");

  for (const ship of ships) {
    for (const position of ship.positions) {
      const cell = cells[position];

      if (!cell.classList.contains("hit")) {
        cell.classList.remove("water");
        cell.classList.add("ship");

        cell.innerHTML = '<i class="bi bi-tsunami"></i>';
      }

      cell.disabled = true;
    }
  }
}

/* Nueva partida */

function newGame() {
  hits = 0;
  misses = 0;

  shots = [];

  gameOver = false;

  placeShips();

  createBoard();

  updateStats();

  messageElement.textContent = "Haz clic en una casilla para comenzar.";
}

/* Reiniciar */

restartButton.addEventListener("click", newGame);

/* Iniciar */

newGame();
