const gridElement = document.getElementById("grid");
const pauseMenu = document.getElementById("pause-menu");
const continueButton = document.getElementById("continue-button");
const resetButton = document.getElementById("reset-button");

function generateMaze(size) {
  // Create a grid filled with walls (1)
  let grid = Array.from({ length: size }, () => Array(size).fill(1));

  // Function to create random paths with loops and more open spaces
  function carvePassages(x, y) {
    let directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0] // Up, Down, Left, Right
    ];
    directions = directions.sort(() => Math.random() - 0.5); // Shuffle directions

    for (let [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0; // Remove wall between cells
        grid[ny][nx] = 0; // Create path
        carvePassages(nx, ny);
      }
    }
  }

  // Start carving from (1,1)
  grid[1][1] = 0; // Ensure starting cell is a path
  carvePassages(1, 1);

  // Reduce density of walls to allow for more open spaces
  const extraOpenings = Math.floor(size * 3); // Allow more openings
  for (let i = 0; i < extraOpenings; i++) {
    let rx = Math.floor(Math.random() * (size - 2)) + 1;
    let ry = Math.floor(Math.random() * (size - 2)) + 1;
    if (grid[ry][rx] === 1) {
      // Randomly make some walls into paths, but keep areas more open
      grid[ry][rx] = 0;
    }
  }

  // Increase the number of loops by adding paths that connect in a variety of ways
  for (let i = 0; i < size * 2; i++) {
    let rx = Math.floor(Math.random() * (size - 2)) + 1;
    let ry = Math.floor(Math.random() * (size - 2)) + 1;
    if (grid[ry][rx] === 1) {
      // Check if there's a nearby open space to form a loop
      if (grid[ry - 1]?.[rx] === 0 || grid[ry + 1]?.[rx] === 0 || grid[ry]?.[rx - 1] === 0 || grid[ry]?.[rx + 1] === 0) {
        grid[ry][rx] = 0; // Create loop by carving open paths
      }
    }
  }

  // Ensure a T-shape (with exactly 4 empty spaces) at the center
  let mid = Math.floor(size / 2);
  let tShape = [
    [mid, mid], [mid, mid - 1], [mid - 1, mid], [mid, mid + 1]
  ];

  // Remove any walls in the T-shape area
  tShape.forEach(([ty, tx]) => {
    grid[ty][tx] = 0;
  });

  // Flood fill to check for inaccessible areas
  function floodFill(x, y, visited) {
    if (x < 0 || x >= size || y < 0 || y >= size || grid[y][x] === 1 || visited[y][x]) {
      return;
    }
    visited[y][x] = true;
    floodFill(x + 1, y, visited);
    floodFill(x - 1, y, visited);
    floodFill(x, y + 1, visited);
    floodFill(x, y - 1, visited);
  }

  let visited = Array.from({ length: size }, () => Array(size).fill(false));
  floodFill(1, 1, visited);

  // If there are inaccessible areas, connect them
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x] === 0 && !visited[y][x]) {
        // Find a nearby accessible cell and connect them
        if (y > 0 && visited[y - 1][x]) {
          grid[y][x] = 0;
          visited[y][x] = true;
        } else if (y < size - 1 && visited[y + 1][x]) {
          grid[y][x] = 0;
          visited[y][x] = true;
        } else if (x > 0 && visited[y][x - 1]) {
          grid[y][x] = 0;
          visited[y][x] = true;
        } else if (x < size - 1 && visited[y][x + 1]) {
          grid[y][x] = 0;
          visited[y][x] = true;
        }
      }
    }
  }

  // Place dots on open paths (avoid T-shape and inaccessible areas)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x] === 0 && !tShape.some(([ty, tx]) => ty === y && tx === x) && visited[y][x]) {
        grid[y][x] = 2; // Place dot only in accessible areas
      }
    }
  }

  // Ensure the starting cell (1,1) does not have a dot
  grid[1][1] = 0;

  return grid;
}



let lives = 3;
let isInvulnerable = false;
let invulnerabilityEndTime = 0;

// Function to update lives
function updateLives() {
  const livesElement = document.getElementById("lives");
  livesElement.textContent = `Lives: ${lives}`;
}

let startTime = Date.now();
let elapsedTime = 0;
let timerInterval;

let isTimerPaused = false;

function updateTimer() {
  if (isTimerPaused) return;
  elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Convertir en secondes
  document.getElementById("timer").textContent = `Time: ${elapsedTime}s`;
}

function startGameTimer() {
  elapsedTime = 0;  // Reset elapsed time
  document.getElementById("timer").textContent = `Time: 0s`; // Update display
  startTime = Date.now(); // Reset start time
  clearInterval(timerInterval); // Clear any existing timer
  timerInterval = setInterval(updateTimer, 1000);
}

// Function to handle Pac-Man being hit by an enemy
function handleEnemyCollision() {
  if (isInvulnerable) return; // Ignore collision if Pac-Man is invulnerable

  lives--; // Lose a life
  updateLives();

  if (lives <= 0) {
    alert("Game Over! Resetting game.");
    resetGame();
    lives = 3; // Reset lives
    updateLives();
  } else {
    // Make Pac-Man invulnerable for 5 seconds
    isInvulnerable = true;
    invulnerabilityEndTime = Date.now() + 5000; // 5 seconds from now
  }
}

// Function to check for collisions between Pac-Man and enemies
function checkCollisions() {
  enemies.forEach(enemy => {
    if (pacman.x === enemy.x && pacman.y === enemy.y) {
      handleEnemyCollision();
    }
  });
}

// Function to update Pac-Man's invulnerability state
function updateInvulnerability() {
  if (isInvulnerable && Date.now() >= invulnerabilityEndTime) {
    isInvulnerable = false; // End invulnerability
  }
}

function drawPacMan(cell) {
  if (isInvulnerable) {
    // Flash Pac-Man by toggling visibility every 200ms
    const flashInterval = 200;
    const isVisible = Math.floor(Date.now() / flashInterval) % 2 === 0;
    if (isVisible) {
      cell.classList.add("pacman");
    }
  } else {
    cell.classList.add("pacman");
  }
}

let fps = 0;
let lastFrameTime = performance.now();
const fpsUpdateInterval = 1000; // Update FPS every 1 second
let frameCount = 0;

// Function to update the FPS counter
function updateFPS() {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime;

  frameCount++;

  // Update FPS every second
  if (deltaTime >= fpsUpdateInterval) {
    fps = Math.round((frameCount * 1000) / deltaTime); // Calculate FPS
    document.getElementById("fps-counter").textContent = `FPS: ${fps}`;

    // Reset counters
    frameCount = 0;
    lastFrameTime = currentTime;
  }
}

// Pac-Man position
let pacman = { x: 1, y: 1 };
let grid = generateMaze(20)
let enemies = [];

function initializeEnemies() {
  enemies = [
    { x: 11, y: 11 },
    { x: 10, y: 10 },
    { x: 9, y: 11 },
    { x: 10, y: 11 },
  ];
}

// Grid drawing
function getWallClass(x, y) {
  if (grid[y][x] !== 1) return ""; // Not a wall

  const top = y > 0 && grid[y - 1][x] === 1;
  const bottom = y < grid.length - 1 && grid[y + 1][x] === 1;
  const left = x > 0 && grid[y][x - 1] === 1;
  const right = x < grid[y].length - 1 && grid[y][x + 1] === 1;

  if (top && bottom && left && right) return "wall-intersection";
  if (top && bottom && left) return "wall-right-end";
  if (top && bottom && right) return "wall-left-end";
  if (left && right && top) return "wall-bottom-end";
  if (left && right && bottom) return "wall-top-end";
  if (left && right) return "wall-horizontal";
  if (top && bottom) return "wall-vertical";
  if (top && left) return "wall-corner-bottom-right";
  if (top && right) return "wall-corner-bottom-left";
  if (bottom && left) return "wall-corner-top-right";
  if (bottom && right) return "wall-corner-top-left";

  return "wall-single"; // Default for isolated walls
}

function drawGrid() {
  gridElement.innerHTML = ""; // Clear previous grid
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (grid[y][x] === 1) {
        cell.classList.add("wall", getWallClass(x, y));
      } else if (grid[y][x] === 2) {
        cell.classList.add("point");
      } else {
        cell.classList.add("path");
      }

      if (x === pacman.x && y === pacman.y) {
        drawPacMan(cell);
      }

      enemies.forEach((enemy, index) => {
        if (x === enemy.x && y === enemy.y) {
          cell.classList.add(index % 2 === 0 ? "enemy-orange" : "enemy-red");
        }
      });

      gridElement.appendChild(cell);
    }
  }
}



let pacmanDirection = { dx: 0, dy: 0 }; // Stores Pac-Man's current direction
let lastMoveTime = 0;
const moveDelay = 250; // Controls movement speed (adjust if needed)
let lastEnemyMoveTime = 0;
const enemyMoveDelay = 600; // Adjust this value to change enemy speed
let score = 0;
const scoreboard = document.getElementById("scoreboard");

// Function to update the score
function updateScore(points) {
  score += points;
  scoreboard.textContent = `Score: ${score}`;
}

// Function to check if all dots are eaten
function allDotsEaten() {
  return grid.every(row => row.every(cell => cell !== 2)); // Check if there are no dots left
}

// Function to generate a new maze
function resetGame() {
  score = 0;
  updateScore(score);
  grid = generateMaze(20); // Generate a new maze
  drawGrid(); // Redraw the grid
  initializeEnemies();
  pacman.x = 1;
  pacman.y = 1;
  pacmanDirection = { dx: 0, dy: 0 }; // Stop Pac-Man's movement
  drawGrid(); // Redraw the grid
  isPaused = false; // Unpause the game

  // Reset lives
  lives = 3;
  updateLives();

  // Reset Timer Properly
  elapsedTime = 0;
  document.getElementById("timer").textContent = `Time: 0s`;
  startGameTimer(); // Restart the timer correctly
}


function nextLevel() {
  grid = generateMaze(20);
  drawGrid();
  pacman.x = 1
  pacman.y = 1
  initializeEnemies()
  startGameTimer()
}

// Function to move Pacman

function movePacman() {
  const currentTime = Date.now();
  if (currentTime - lastMoveTime < moveDelay) return; // Enforce movement delay
  lastMoveTime = currentTime;

  const newX = pacman.x + pacmanDirection.dx;
  const newY = pacman.y + pacmanDirection.dy;

  // Check if the new position is within bounds and not a wall
  if (grid[newY] && grid[newY][newX] !== 1) {
    pacman.x = newX;
    pacman.y = newY;

    // Eat dot and update score
    if (grid[newY][newX] === 2) {
      grid[newY][newX] = 0; // Mark dot as eaten
      updateScore(10); // Each dot gives 10 points
    }

    // Check if all dots are eaten and start new level
    if (allDotsEaten()) {
      alert("All dots are eaten! Generating new map.");
      nextLevel();
    }
  } else {
    // If Pac-Man hits a wall, stop moving
    pacmanDirection = { dx: 0, dy: 0 };
  }

  drawGrid(); // Redraw the grid after moving
}


// Function to move enemies
function moveEnemies() {
  const currentTime = Date.now();
  if (currentTime - lastEnemyMoveTime < enemyMoveDelay) return;
  lastEnemyMoveTime = currentTime;

  enemies.forEach(enemy => {
    const path = findPath(enemy, pacman);
    if (path.length > 1) {
      const nextCell = path[1];

      // Check if the next cell is not occupied by another enemy
      const isCellOccupied = enemies.some(otherEnemy => 
        otherEnemy.x === nextCell.x && otherEnemy.y === nextCell.y
      );

      if (!isCellOccupied) {
        enemy.x = nextCell.x;
        enemy.y = nextCell.y;
      }
    }
  });

  drawGrid();
}

function findPath(start, goal) {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(start, 0);
  fScore.set(start, heuristic(start, goal));

  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    openSet.splice(openSet.indexOf(current), 1);

    getNeighbors(current).forEach(neighbor => {
      const tentativeGScore = gScore.get(current) + 1;

      if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, gScore.get(neighbor) + heuristic(neighbor, goal));

        if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return [];
}

function getNeighbors(node) {
  const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
  return directions
    .map(dir => ({ x: node.x + dir.dx, y: node.y + dir.dy }))
    .filter(pos => grid[pos.y] && grid[pos.y][pos.x] !== 1);
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    path.unshift(current);
  }
  return path;
}

let isPaused = false;

function pauseGame() {
  isPaused = !isPaused; // Toggle pause
  pauseMenu.classList.toggle("hidden", !isPaused); // Show/hide pause menu

  if (isPaused) {
    isTimerPaused = true; // pause the timer
  } else {
    isTimerPaused = false; // restart the timer
    startTime += Date.now() - (startTime + elapsedTime * 1000); // adjust start time
  }
}

continueButton.addEventListener("click", () => {
  pauseGame(); // Unpause the game
});

resetButton.addEventListener("click", () => {
  resetGame(); // Reset the game
  pauseGame(); // Hide the pause menu
});

// Game loop to run with requestAnimationFrame
function gameLoop() {
  if (isPaused) {
    requestAnimationFrame(gameLoop);
    return; // Stop further updates
  }

  movePacman();
  moveEnemies();
  checkCollisions();
  updateInvulnerability();
  drawGrid();
  updateFPS();

  requestAnimationFrame(gameLoop);
}


// Listen for arrow key presses
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
      pauseGame(); // Toggle pause menu
  } else if (!isPaused) {
      // Only allow movement if the game is not paused
      if (event.key === "ArrowUp") pacmanDirection = { dx: 0, dy: -1 };
      if (event.key === "ArrowDown") pacmanDirection = { dx: 0, dy: 1 };
      if (event.key === "ArrowLeft") pacmanDirection = { dx: -1, dy: 0 };
      if (event.key === "ArrowRight") pacmanDirection = { dx: 1, dy: 0 };
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const backgroundMusic = new Audio("./audio/Hunting for your Dream  Hunter x Hunter Ending 2 Creditless.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.1; // Adjust volume as needed

  // Try to autoplay
  const playMusic = () => {
      backgroundMusic.play().then(() => {
          console.log("Music playing!");
      }).catch(() => {
          console.log("Autoplay blocked. Waiting for user interaction.");
      });
  };

  playMusic(); // Attempt to play on page load

  // If autoplay is blocked, start music on first user interaction
  document.addEventListener("click", () => {
      backgroundMusic.play();
  }, { once: true }); // Ensures this event runs only once
});


// Draw the grid for the first time
updateLives();
drawGrid();
initializeEnemies();
startGameTimer();
gameLoop();