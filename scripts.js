// Game grid
const grid = document.querySelector('.grid');
const gridSize = { rows: 11, columns: 13 };
let bombermanPosition = { x: 1, y: 1 };
let bomberman2Position = { x: gridSize.columns - 2, y: gridSize.rows - 2 };

const INTRO_DURATION = 3000;
const NUMBER_OF_LIVES = 10;
const BLAST_DURATION = 500;
const BOMB_TIMER = 2000;
const WALLS_PERCENTAGE = 0.1;
const DESTRUCTIBLE_ITEMS_PERCENTAGE = 0.3;
const directions = ['up', 'down', 'left', 'right']

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
    updateBombermanPosition(pos1.x, pos1.y);

    const pos2 = findRandomPosition([...forbiddenPositions, pos1]);
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

window.addEventListener('keydown', (event) => {
    switch (event.key) {

        // player 1
        case 'ArrowUp':
            moveBomberman(bombermanPosition, 'up', updateBombermanPosition);
            break;
        case 'ArrowDown':
            moveBomberman(bombermanPosition, 'down', updateBombermanPosition);
            break;
        case 'ArrowLeft':
            moveBomberman(bombermanPosition, 'left', updateBombermanPosition);
            break;
        case 'ArrowRight':
            moveBomberman(bombermanPosition, 'right', updateBombermanPosition);
            break;
        case ' ':
        case 'Spacebar': // For older browsers
            placeBomb(bombermanPosition.x, bombermanPosition.y);
            break;

        // player 2
        case 'w':
        case 'W':
            moveBomberman(bomberman2Position, 'up', updateBombermanPosition2);
            break;
        case 's':
        case 'S':
            moveBomberman(bomberman2Position, 'down', updateBombermanPosition2);
            break;
        case 'a':
        case 'A':
            moveBomberman(bomberman2Position, 'left', updateBombermanPosition2);
            break;
        case 'd':
        case 'D':
            moveBomberman(bomberman2Position, 'right', updateBombermanPosition2);
            break;
        case 'z':
        case 'Z':
            placeBomb(bomberman2Position.x, bomberman2Position.y);

        default:
            break;
    }
});

function moveBomberman(bombermanPosition, direction, updatePosition) {
    let newX = bombermanPosition.x;
    let newY = bombermanPosition.y;

    switch (direction) {
        case 'up':
            if (newY > 0) {
                newY -= 1;
            }
            break;
        case 'down':
            if (newY < gridSize.rows - 1) {
                newY += 1;
            }
            break;
        case 'left':
            if (newX > 0) {
                newX -= 1;
            }
            break;
        case 'right':
            if (newX < gridSize.columns - 1) {
                newX += 1;
            }
            break;
        default:
            return;
    }

    updatePosition(newX, newY);
}

function placeBomb(x, y) {
    const bomb = getCell(x, y);
    bomb.classList.add('bomb');

    // Explode bomb after a short duration
    setTimeout(() => {
        explodeBomb(x, y);
    }, BOMB_TIMER);
}

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
    if (isGameEnded()) {
        // endGame(player === 1 ? 2 : 1); // Pass the winning player
        showGameEndedOverlay(player === 1 ? 2 : 1);
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

function isGameEnded() {
    return bombermanLives <= 0 || bomberman2Lives <= 0;
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
    const items = grid.querySelectorAll('.destructible');
    items.forEach((cell) => {
        cell.classList.remove('destructible');
    });

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
    showModal();
    setTimeout(() => {
        generateWalls();
        generateDestructibleItems();
    }, 1000);
});

document.getElementById('try-again').addEventListener('click', () => {
    showModal();
    setTimeout(() => {
        hideGameEndedOverlay();
        generateWalls();
        generateDestructibleItems();
        bombermanLives = NUMBER_OF_LIVES;
        bomberman2Lives = NUMBER_OF_LIVES;
    }, 1000);
});


var pieSocket = new PieSocket({
    clusterId: "s8709.fra1",
    apiKey: "UJPnzAysgGthXbqJ2qInHjQKrF2wFigeTOzuKhbW",
    notifySelf: true
});



pieSocket.subscribe("best-room")
    .then((channel) => {
        console.log("Channel is ready");
        channel.listen("event", ({ player, action }, meta) => {
            console.log(player, action);

            if (player == '1') {
                if (action == 'bomb') {
                    placeBomb(bombermanPosition.x, bombermanPosition.y);
                }
                else if (directions.includes(action)) {
                    moveBomberman(bombermanPosition, action, updateBombermanPosition)
                }
            }
            if (player == '2') {
                if (action == 'bomb') {
                    placeBomb(bomberman2Position.x, bomberman2Position.y);
                }
                else if (directions.includes(action)) {
                    moveBomberman(bomberman2Position, action, updateBombermanPosition2)
                }
            }
        });
    });


function showModal() {
    const modal = document.getElementById('fullscreen-modal');
    modal.classList.remove('hidden');

    setTimeout(() => {
        hideModal();
    }, INTRO_DURATION);
}

function hideModal() {
    const modal = document.getElementById('fullscreen-modal');
    modal.classList.add('hidden');
}

// Show the modal on page load
showModal();


function showGameEndedOverlay(winner) {
    const overlay = document.querySelector('.game-ended-overlay');
    const message = document.querySelector('.winner-message');

    message.textContent = `Player ${winner} won the game!`;
    overlay.classList.add('visible');
}

function hideGameEndedOverlay() {
    const overlay = document.querySelector('.game-ended-overlay');
    overlay.classList.remove('visible');
}