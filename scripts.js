// Game grid
const grid = document.querySelector('.grid');
const gridSize = { rows: 11, columns: 13 };
let bombermanPosition = { x: 1, y: 1 };
let bomberman2Position = { x: gridSize.columns - 2, y: gridSize.rows - 2 };

// Life counters
let bombermanLives = 3;
let bomberman2Lives = 3;

// Create grid
function createGrid() {
    for (let i = 0; i < gridSize.rows * gridSize.columns; i++) {
        const cell = document.createElement('div');
        grid.appendChild(cell);
    }
}

createGrid();

// Helper functions
function getCell(x, y) {
    return grid.children[y * gridSize.columns + x];
}

// Update life counters in HTML
function updateLives() {
    document.getElementById('bomberman-lives').textContent = bombermanLives;
    document.getElementById('bomberman2-lives').textContent = bomberman2Lives;
}

// Check if a cell is in the blast area
function isCellInBlast(x, y) {
    return getCell(x, y).classList.contains('blast');
}

function updateBombermanPosition(x, y) {
    getCell(bombermanPosition.x, bombermanPosition.y).classList.remove('bomberman');
    getCell(x, y).classList.add('bomberman');
    bombermanPosition = { x, y };
}

// Initialize Bomberman
updateBombermanPosition(1, 1);
updateBombermanPosition2(gridSize.columns - 2, gridSize.rows - 2);


// // Bomb explosion
// function explodeBomb(x, y) {
//   const bomb = getCell(x, y);
//   bomb.classList.remove('bomb');
//   bomb.classList.add('explosion');

//   // Remove explosion after a short duration
//   setTimeout(() => {
//     bomb.classList.remove('explosion');
//   }, 500);
// }


// Bomb explosion
function explodeBomb(x, y) {
    const bomb = getCell(x, y);
    bomb.classList.remove('bomb');
    bomb.classList.add('explosion');

    // Create blast effect
    const blastDirections = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
    ];

    const blastCells = [];

    for (let direction of blastDirections) {
        for (let i = 1; i <= 4; i++) {
            const blastX = x + direction.x * i;
            const blastY = y + direction.y * i;

            // Check if blast is within grid boundaries
            if (blastX >= 0 && blastX < gridSize.columns && blastY >= 0 && blastY < gridSize.rows) {
                const blastCell = getCell(blastX, blastY);
                blastCell.classList.add('blast');
                blastCells.push(blastCell);
            }
        }
    }

    // // Remove explosion and blast after a short duration
    // setTimeout(() => {
    //   bomb.classList.remove('explosion');
    //   blastCells.forEach((blastCell) => {
    //     blastCell.classList.remove('blast');
    //   });
    // }, 500);


    // Remove explosion and blast after a short duration
    setTimeout(() => {
        bomb.classList.remove('explosion');
        // Check if a Bomberman is hit by the blast
        if (isCellInBlast(bombermanPosition.x, bombermanPosition.y)) {
            bombermanLives--;
            updateLives();
            respawnBomberman(1);
        }
        if (isCellInBlast(bomberman2Position.x, bomberman2Position.y)) {
            bomberman2Lives--;
            updateLives();
            respawnBomberman(2);
        }

        blastCells.forEach((blastCell) => {
            blastCell.classList.remove('blast');
        });

    }, 500);

}


// Keydown event listener
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (bombermanPosition.y > 0) {
                updateBombermanPosition(bombermanPosition.x, bombermanPosition.y - 1);
            }
            break;
        case 'ArrowDown':
            if (bombermanPosition.y < gridSize.rows - 1) {
                updateBombermanPosition(bombermanPosition.x, bombermanPosition.y + 1);
            }
            break;
        case 'ArrowLeft':
            if (bombermanPosition.x > 0) {
                updateBombermanPosition(bombermanPosition.x - 1, bombermanPosition.y);
            }
            break;
        case 'ArrowRight':
            if (bombermanPosition.x < gridSize.columns - 1) {
                updateBombermanPosition(bombermanPosition.x + 1, bombermanPosition.y);
            }
            break;
        case ' ':
        case 'Spacebar': // For older browsers
            const bombX = bombermanPosition.x;
            const bombY = bombermanPosition.y;
            const bomb = getCell(bombX, bombY);
            bomb.classList.add('bomb');

            // Explode bomb after a short duration
            setTimeout(() => {
                explodeBomb(bombX, bombY);
            }, 2000);
            break;
        default:
            break;
    }
});

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        // ... (keep the existing cases for Bomberman 1)

        // Controls for Bomberman 2
        case 'w':
        case 'W':
            if (bomberman2Position.y > 0) {
                updateBombermanPosition2(bomberman2Position.x, bomberman2Position.y - 1);
            }
            break;
        case 's':
        case 'S':
            if (bomberman2Position.y < gridSize.rows - 1) {
                updateBombermanPosition2(bomberman2Position.x, bomberman2Position.y + 1);
            }
            break;
        case 'a':
        case 'A':
            if (bomberman2Position.x > 0) {
                updateBombermanPosition2(bomberman2Position.x - 1, bomberman2Position.y);
            }
            break;
        case 'd':
        case 'D':
            if (bomberman2Position.x < gridSize.columns - 1) {
                updateBombermanPosition2(bomberman2Position.x + 1, bomberman2Position.y);
            }
            break;
        case 'z':
        case 'Z':
            const bomb2X = bomberman2Position.x;
            const bomb2Y = bomberman2Position.y;
            const bomb2 = getCell(bomb2X, bomb2Y);
            bomb2.classList.add('bomb');

            // Explode bomb after a short duration
            setTimeout(() => {
                explodeBomb(bomb2X, bomb2Y);
            }, 2000);
            break;
        default:
            break;
    }
});

// Update the updateBombermanPosition function to handle the second player
function updateBombermanPosition2(x, y) {
    getCell(bomberman2Position.x, bomberman2Position.y).classList.remove('bomberman2');
    getCell(x, y).classList.add('bomberman2');
    bomberman2Position = { x, y };
}

// Respawn a Bomberman
function respawnBomberman(player) {
    const bomberman = player === 1 ? 'bomberman' : 'bomberman2';
    const position = player === 1 ? bombermanPosition : bomberman2Position;
    getCell(position.x, position.y).classList.remove(bomberman);
  
    // Place Bomberman at a random position after a delay
    setTimeout(() => {
      let forbiddenPositions = []; // Replace with the function returning the list of forbidden positions
  
      let x, y;
      do {
        x = Math.floor(Math.random() * gridSize.columns);
        y = Math.floor(Math.random() * gridSize.rows);
      } while (forbiddenPositions.some(pos => pos.x === x && pos.y === y));
  
      if (player === 1) {
        updateBombermanPosition(x, y);
      } else {
        updateBombermanPosition2(x, y);
      }
    }, 3000);
  }