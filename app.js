const gridElement = document.getElementById("grid");

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
    [mid, mid], [mid , mid - 1], [mid - 1, mid], [mid, mid + 1]
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


// 0 = path
// 1 = wall
// 2 = dot

// Pac-Man position
let pacman = { x: 1, y: 1 };
let grid = generateMaze(20)
let enemies = [];

function initializeEnemies() {
  const mid = Math.floor(grid.length / 2); // Middle of the grid
  const tShape = [
    [mid, mid],     // Center
    [mid, mid - 1], // Left
    [mid - 1, mid], // Top
    [mid, mid + 1]  // Right
  ];

  // Place enemies in the T-shaped area
  enemies = tShape.map(([y, x]) => ({ x, y }));
}

// Grid drawing
function drawGrid() {
  gridElement.innerHTML = ""; // Remove existing grid
  for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          if (grid[y][x] === 1) cell.classList.add("wall");
          else if (grid[y][x] === 2) cell.classList.add("point");
          else cell.classList.add("path");

          // Draw Pac-Man with invulnerability effect
          if (x === pacman.x && y === pacman.y) {
              drawPacMan(cell);
          }

          // Draw enemies
          enemies.forEach(enemy => {
              if (x === enemy.x && y === enemy.y) {
                  cell.classList.add("enemy");
              }
          });

          gridElement.appendChild(cell);
      }
  }
}

let lastMoveTime = 0;
const moveDelay = 200;
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
    score = 0
    updateScore(score)
    grid = generateMaze(20); // Generate a new maze
    drawGrid(); // Redraw the grid
    initializeEnemies();
    pacman.x = 1
    pacman.y = 1
}

function nextLevel(){
  grid = generateMaze(20);
  drawGrid();
  pacman.x = 1
  pacman.y = 1
}

// Function to move Pacman
function movePacman(dx, dy) {
    const currentTime = Date.now();
    if (currentTime - lastMoveTime < moveDelay) return;
    lastMoveTime = currentTime;

    const newX = pacman.x + dx;
    const newY = pacman.y + dy;

    if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
        if (grid[newY][newX] !== 1) {
            pacman.x = newX;
            pacman.y = newY;

            // Eat dot and update score
            if (grid[newY][newX] === 2) {
                grid[newY][newX] = 0; // Mark dot as eaten
                updateScore(10); // Each dot gives 10 points
            }

            // Check if all dots are eaten and reset the game
            if (allDotsEaten()) {
                alert("All dots are eaten! Generating new map.");
                nextLevel(); // Reset the grid with the current score
            }

            drawGrid(); // Redraw the grid after the move
        }
    }
}

// Function to move enemies
function moveEnemies () {
    enemies.forEach(enemy => {
        const direction = Math.floor(Math.random() * 60);
        let dx = 0, dy = 0;
        if (direction === 0) dy = -1; // Up
        if (direction === 1) dy = 1;  // Down
        if (direction === 2) dx = -1; // Left
        if (direction === 3) dx = 1;  // Right

        const newX = enemy.x + dx;
        const newY = enemy.y + dy;

        if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length && grid[newY][newX] !== 1) {
            enemy.x = newX;
            enemy.y = newY;
        }
    });
}

// Game loop to run with requestAnimationFrame
function gameLoop() {
  moveEnemies();
  checkCollisions();
  updateInvulnerability();
  drawGrid();
  updateFPS();
  requestAnimationFrame(gameLoop);
}

// Listen for arrow key presses
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") movePacman(0, -1);
    if (event.key === "ArrowDown") movePacman(0, 1);
    if (event.key === "ArrowLeft") movePacman(-1, 0);
    if (event.key === "ArrowRight") movePacman(1, 0);
});

// Draw the grid for the first time
updateLives();
drawGrid();
initializeEnemies();
gameLoop();
