// Game grid
const grid = document.querySelector('.grid');
const gridSize = { rows: 11, columns: 13 };
let bombermanPosition = { x: 1, y: 1 };
let bomberman2Position = { x: gridSize.columns - 2, y: gridSize.rows - 2 };


const NUMBER_OF_LIVES = 10;
const BLAST_DURATION = 500;
const BOMB_TIMER = 2000;
const WALLS_PERCENTAGE = 0.1;
const DESTRUCTIBLE_ITEMS_PERCENTAGE = 0.3;

let walls = [];
let bombermanLives = NUMBER_OF_LIVES;
let bomberman2Lives = NUMBER_OF_LIVES;

updateLives()
createGrid();
generateWalls();
generateDestructibleItems();
initBombermans();

// Create grid
function createGrid() {
    for (let y = 0; y < gridSize.rows; y++) {
        for (let x = 0; x < gridSize.columns; x++) {
            const cell = document.createElement('div');
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            grid.appendChild(cell);
        }
    }
}
// Helper functions
function getCell(x, y) {
    return grid.children[y * gridSize.columns + x];
}

// Update life counters in HTML
function updateLives() {
    const livesContainers = [
        { element: document.getElementById("bomberman-lives"), lives: bombermanLives, class: "player_1" },
        { element: document.getElementById("bomberman2-lives"), lives: bomberman2Lives, class: "player_2" },
    ];

    livesContainers.forEach(({ element, lives, class: className }) => {
        element.innerHTML = "";
        for (let i = 0; i < NUMBER_OF_LIVES; i++) {
            const life = document.createElement("div");
            life.classList.add(className);
            if (i >= lives) {
                life.classList.add("dead");
            }
            element.appendChild(life);
        }
    });
}

// Check if a cell is in the blast area
function isCellInBlast(x, y) {
    return getCell(x, y).classList.contains('blast');
}

function updateBombermanPosition(x, y) {
    if (getForbiddenPositions().some(pos => pos.x === x && pos.y === y)) {
        return;
    }

    getCell(bombermanPosition.x, bombermanPosition.y).classList.remove('bomberman');
    getCell(x, y).classList.add('bomberman');
    bombermanPosition = { x, y };
}

function findRandomPosition(forbiddenPositions) {
    let x, y;

    do {
        x = Math.floor(Math.random() * gridSize.columns);
        y = Math.floor(Math.random() * gridSize.rows);
    } while (forbiddenPositions.some(pos => pos.x === x && pos.y === y));

    return { x, y };
}

function initBombermans() {
    const forbiddenPositions = getForbiddenPositions();

    // Find valid random positions for both Bombermans
    const pos1 = findRandomPosition(forbiddenPositions);
    const pos2 = findRandomPosition([...forbiddenPositions, pos1]);

    // Initialize Bombermans
    updateBombermanPosition(pos1.x, pos1.y);
    updateBombermanPosition2(pos2.x, pos2.y);
}

// Bomb explosion
function explodeBomb(x, y) {
    const bomb = getCell(x, y);
    bomb.classList.remove('bomb');
    bomb.classList.add('explosion');

    const blastCells = generateBlastCells(x, y);

    // Remove explosion and blast after a short duration
    setTimeout(() => {

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
        bomb.classList.remove('explosion');
        blastCells.forEach((blastCell) => {
            blastCell.classList.remove('blast');
        });

    }, BLAST_DURATION);

}

function generateBlastCells(x, y) {
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
            if (
                blastX >= 0 &&
                blastX < gridSize.columns &&
                blastY >= 0 &&
                blastY < gridSize.rows
            ) {
                const blastCell = getCell(blastX, blastY);

                if (blastCell.classList.contains('wall')) {
                    break;
                } else if (blastCell.classList.contains('destructible')) {
                    blastCell.classList.remove('destructible');
                    blastCell.classList.add('blast');
                    blastCells.push(blastCell);
                    break;
                } else {
                    blastCell.classList.add('blast');
                    blastCells.push(blastCell);
                }
            }
        }
    }

    return blastCells;
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
            }, BOMB_TIMER);
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
    if (getForbiddenPositions().some(pos => pos.x === x && pos.y === y)) {
        return;
    }

    getCell(bomberman2Position.x, bomberman2Position.y).classList.remove('bomberman2');
    getCell(x, y).classList.add('bomberman2');
    bomberman2Position = { x, y };
}

// Respawn a Bomberman
function respawnBomberman(player) {

    const lives = player === 1 ? bombermanLives : bomberman2Lives;

    if (lives <= 0) {
        endGame(player === 1 ? 2 : 1); // Pass the winning player
        return;
    }

    const bomberman = player === 1 ? 'bomberman' : 'bomberman2';
    const position = player === 1 ? bombermanPosition : bomberman2Position;
    getCell(position.x, position.y).classList.remove(bomberman);

    // Place Bomberman at a random position after a delay
    setTimeout(() => {

        let x, y;
        do {
            x = Math.floor(Math.random() * gridSize.columns);
            y = Math.floor(Math.random() * gridSize.rows);
        } while (getForbiddenPositions().some(pos => pos.x === x && pos.y === y));

        if (player === 1) {
            updateBombermanPosition(x, y);
        } else {
            updateBombermanPosition2(x, y);
        }
    }, 3000);
}

// Display end game message
function endGame(winner) {
    const overlay = document.querySelector('.overlay');
    const message = document.querySelector('.overlay .message');

    message.textContent = `Player ${winner} wins!`;
    overlay.classList.add('visible');
}

function getForbiddenPositions() {
    return [...walls, ...getBombsPositions(), ...getPlayersPositions(), ...getDestructiblesPositions()];
}

function getBombsPositions() {
    const bombs = [];
    const cells = grid.querySelectorAll('.bomb');

    cells.forEach((cell) => {
        const x = parseInt(cell.getAttribute('data-x'), 10);
        const y = parseInt(cell.getAttribute('data-y'), 10);
        bombs.push({ x, y });
    });

    return bombs;
}

function getPlayersPositions() {
    return [{ x: bombermanPosition.x, y: bombermanPosition.y }, { x: bomberman2Position.x, y: bomberman2Position.y }];
}


function getDestructiblesPositions() {
    const positions = [];
    const cells = grid.querySelectorAll('.destructible');

    cells.forEach((cell) => {
        const x = parseInt(cell.getAttribute('data-x'), 10);
        const y = parseInt(cell.getAttribute('data-y'), 10);
        positions.push({ x, y });
    });

    return positions;
}



function generateWalls() {
    // Remove existing wall classes from cells
    const existingWalls = grid.querySelectorAll('.wall');
    walls = [];
    existingWalls.forEach((cell) => {
        cell.classList.remove('wall');
    });

    const totalCells = gridSize.rows * gridSize.columns;
    const maxWalls = Math.floor(totalCells * WALLS_PERCENTAGE);

    while (walls.length < maxWalls) {
        const x = Math.floor(Math.random() * gridSize.columns);
        const y = Math.floor(Math.random() * gridSize.rows);

        // Check if the cell is not already in the walls array
        if (!walls.some((wall) => wall.x === x && wall.y === y)) {
            walls.push({ x, y });

            // Add .wall class to the cell
            const cell = getCell(x, y);
            cell.classList.add('wall');
        }
    }
}

function generateDestructibleItems() {
    const totalCells = gridSize.rows * gridSize.columns;
    const maxDestructibleItems = Math.floor(totalCells * DESTRUCTIBLE_ITEMS_PERCENTAGE);

    let placedItems = 0;
    while (placedItems < maxDestructibleItems) {
        const x = Math.floor(Math.random() * gridSize.columns);
        const y = Math.floor(Math.random() * gridSize.rows);

        const cell = getCell(x, y);
        if (!cell.classList.contains('wall') && !cell.classList.contains('destructible')) {
            cell.classList.add('destructible');
            placedItems++;
        }
    }
}

document.getElementById('generate-new-board').addEventListener('click', () => {
    generateWalls();
});
