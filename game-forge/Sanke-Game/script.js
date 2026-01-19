const GRID_SIZE = 20;
const CELL_SIZE = 20;

let snake = [[10, 10]];
let direction = { x: 1, y: 0 };
let nextDirection = direction;
let food = generateFood();
let isPlaying = false;
let isGameOver = false;
let score = 0;

const gameBoard = document.getElementById("gameBoard");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const scoreText = document.getElementById("scoreText");
const startBtn = document.getElementById("startBtn");

function generateFood() {
    let newFood;
    while (true) {
        newFood = [
            Math.floor(Math.random() * GRID_SIZE),
            Math.floor(Math.random() * GRID_SIZE)
        ];
        if (!snake.some(s => s[0] === newFood[0] && s[1] === newFood[1])) break;
    }
    return newFood;
}

function startGame() {
    snake = [[10, 10]];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    food = generateFood();
    score = 0;
    scoreText.innerHTML = "Score: 0";
    isPlaying = true;
    isGameOver = false;
    overlay.classList.add("hidden");
}

function draw() {
    gameBoard.innerHTML = "";

    snake.forEach((segment, i) => {
        const div = document.createElement("div");
        div.className = "snake";
        div.style.left = segment[0] * CELL_SIZE + "px";
        div.style.top = segment[1] * CELL_SIZE + "px";
        gameBoard.appendChild(div);
    });

    const foodDiv = document.createElement("div");
    foodDiv.className = "food";
    foodDiv.style.left = food[0] * CELL_SIZE + 2 + "px";
    foodDiv.style.top = food[1] * CELL_SIZE + 2 + "px";
    gameBoard.appendChild(foodDiv);
}

function move() {
    if (!isPlaying || isGameOver) return;

    direction = nextDirection;

    const head = snake[0];
    const newHead = [head[0] + direction.x, head[1] + direction.y];

    // Wall hit
    if (
        newHead[0] < 0 || newHead[0] >= GRID_SIZE ||
        newHead[1] < 0 || newHead[1] >= GRID_SIZE
    ) {
        endGame();
        return;
    }

    // Body hit
    if (snake.some(s => s[0] === newHead[0] && s[1] === newHead[1])) {
        endGame();
        return;
    }

    snake = [newHead, ...snake];

    // Food hit
    if (newHead[0] === food[0] && newHead[1] === food[1]) {
        score += 10;
        scoreText.innerHTML = "Score: " + score;
        food = generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function endGame() {
    isGameOver = true;
    isPlaying = false;
    overlayText.innerHTML = "Game Over! Score: " + score;
    startBtn.innerHTML = "Play Again";
    overlay.classList.remove("hidden");
}

document.addEventListener("keydown", (e) => {
    if (!isPlaying && !isGameOver) startGame();

    if (e.key === "ArrowUp" && direction.y !== 1) nextDirection = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && direction.y !== -1) nextDirection = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && direction.x !== 1) nextDirection = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && direction.x !== -1) nextDirection = { x: 1, y: 0 };
});

startBtn.onclick = startGame;

setInterval(move, 150);
draw();
