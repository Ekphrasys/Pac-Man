const gridElement = document.getElementById("grid");

// Configuration du jeu
const gridSize = 20;
const grid = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 1],
    [1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 2, 1],
    [1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

// Position de Pac-Man
let pacman = { x: 1, y: 1 };

// Générer la grille HTML
function drawGrid() {
  gridElement.innerHTML = ""; // Effacer la grille existante
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

      gridElement.appendChild(cell);
    }
  }
}

// Déplacement de Pac-Man
function movePacman(dx, dy) {
  const newX = pacman.x + dx;
  const newY = pacman.y + dy;

  // Vérifier les collisions avec les murs
  if (grid[newY][newX] !== 1) {
    pacman.x = newX;
    pacman.y = newY;

    // Manger un point
    if (grid[newY][newX] === 2) {
      grid[newY][newX] = 0; // Marquer le point comme mangé
    }

    drawGrid(); // Redessiner la grille
  }
}

// Écouter les touches pour déplacer Pac-Man
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") movePacman(0, -1);
  if (event.key === "ArrowDown") movePacman(0, 1);
  if (event.key === "ArrowLeft") movePacman(-1, 0);
  if (event.key === "ArrowRight") movePacman(1, 0);
});

// Dessiner la grille initiale
drawGrid();
