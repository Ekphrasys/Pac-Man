const gridElement = document.getElementById("grid");

// game grid configuration
function generateMaze(size) {
  // Create a grid filled with walls (1)
  let grid = Array.from({ length: size }, () => Array(size).fill(1));

  // Function to create random paths with loops
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
  grid[1][1] = 0;
  carvePassages(1, 1);

  // Increase the number of random openings for a more open layout
  let extraOpenings = Math.floor(size * 1.5); // More openings
  for (let i = 0; i < extraOpenings; i++) {
    let rx = Math.floor(Math.random() * (size - 2)) + 1;
    let ry = Math.floor(Math.random() * (size - 2)) + 1;
    if (grid[ry][rx] === 1 && ((grid[ry - 1]?.[rx] === 0) || (grid[ry + 1]?.[rx] === 0) || (grid[ry]?.[rx - 1] === 0) || (grid[ry]?.[rx + 1] === 0))) {
      grid[ry][rx] = 0;
    }
  }

  // Ensure the T-shaped open space in the middle
  let mid = Math.floor(size / 2);
  let tShape = [
    [mid, mid], [mid - 1, mid], [mid + 1, mid], [mid, mid - 1]
  ];
  
  for (let [y, x] of tShape) {
    grid[y][x] = 0; // Ensure the T-shape is empty space
  }

  // Place dots only on valid paths, but avoid T-shaped area
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x] === 0 && !tShape.some(([ty, tx]) => ty === y && tx === x)) {
        grid[y][x] = 2; // Place dot
      }
    }
  }

  return grid;
}

let grid = generateMaze(20)

// 0 = path
// 1 = wall
// 2 = dot

// Pac-Man position
let pacman = { x: 1, y: 1 };

let enemies = [
  { x: 10, y: 9 },
  { x: 10, y: 8 },
  { x: 11, y: 9 },
  { x: 9, y: 9 },
];

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

      if (x === pacman.x && y === pacman.y) {
        cell.classList.add("pacman");
      }

      // Check if an enemy is at this position
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
// Pac-man movement
function movePacman(dx, dy) {
  const currentTime = Date.now();
  if (currentTime - lastMoveTime < moveDelay) {
    return; // Exit if the delay time has not passed
  }
  lastMoveTime = currentTime;

  const newX = pacman.x + dx;
  const newY = pacman.y + dy;

  // Check if the new position is within the grid
  if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
    // wall collisions
    if (grid[newY][newX] !== 1) {
      pacman.x = newX;
      pacman.y = newY;

      // Eat dot
      if (grid[newY][newX] === 2) {
        grid[newY][newX] = 0; // mark the dot as eaten
      }

      drawGrid(); // redraw the grid
    }
  }
}

// (Fonction de mouvements épileptiques qu'il faut changer vite)
function moveEnemies () {
  enemies.forEach(enemy => {
    // Simple random movement logic
    const direction = Math.floor(Math.random() * 60);
    let dx = 0, dy = 0;
    if (direction === 0) dy = -1; // Up
    if (direction === 1) dy = 1;  // Down
    if (direction === 2) dx = -1; // Left
    if (direction === 3) dx = 1;  // Right

    const newX = enemy.x + dx;
    const newY = enemy.y + dy;

    // Check if the new position is within the grid and not a wall
    if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length && grid[newY][newX] !== 1) {
      enemy.x = newX;
      enemy.y = newY;
    }
  });
}

// game loop to run with requestAnimationFrame
function gameLoop() {
  moveEnemies();
  drawGrid();
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
drawGrid();
gameLoop();