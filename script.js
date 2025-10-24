// Variables del juego
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('current-score');
const finalScoreDisplay = document.getElementById('final-score');
const gameOverDisplay = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

// Nuevos elementos del DOM
const saveScoreBtn = document.getElementById('save-score-btn');
const viewScoresBtn = document.getElementById('view-scores-btn');
const savedScoresPanel = document.getElementById('saved-scores');
const scoresList = document.getElementById('scores-list');
const clearScoresBtn = document.getElementById('clear-scores-btn');
const backToGameBtn = document.getElementById('back-to-game-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 100;
let gameRunning = false;
let gameInterval;

// Array para almacenar puntuaciones
let savedScores = [];

// Cargar puntuaciones guardadas al iniciar
function loadSavedScores() {
    const storedScores = localStorage.getItem('snakeScores');
    if (storedScores) {
        savedScores = JSON.parse(storedScores);
    }
}

// Guardar puntuaciones en localStorage
function saveScoresToStorage() {
    localStorage.setItem('snakeScores', JSON.stringify(savedScores));
}

// Guardar la puntuación actual
function saveCurrentScore() {
    if (score === 0) {
        alert("¡No puedes guardar una puntuación de 0!");
        return;
    }
    
    const playerName = prompt("Ingresa tu nombre para guardar la puntuación:", "Jugador");
    
    if (playerName) {
        const scoreData = {
            name: playerName,
            score: score,
            date: new Date().toLocaleDateString()
        };
        
        savedScores.push(scoreData);
        saveScoresToStorage();
        alert(`¡Puntuación de ${score} guardada para ${playerName}!`);
    }
}

// Mostrar puntuaciones guardadas
function displaySavedScores() {
    scoresList.innerHTML = '';
    
    if (savedScores.length === 0) {
        scoresList.innerHTML = '<li>No hay puntuaciones guardadas</li>';
        return;
    }
    
    // Ordenar por puntuación descendente
    savedScores.sort((a, b) => b.score - a.score);
    
    savedScores.forEach((scoreData, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${scoreData.name}: ${scoreData.score} puntos (${scoreData.date})`;
        scoresList.appendChild(li);
    });
}

// Limpiar todas las puntuaciones
function clearAllScores() {
    if (confirm("¿Estás seguro de que quieres borrar todas las puntuaciones guardadas?")) {
        savedScores = [];
        saveScoresToStorage();
        displaySavedScores();
    }
}

// Inicializar el juego
function initGame() {
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    generateFood();
    
    dx = 1;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = `Puntuación: ${score}`;
    
    gameOverDisplay.style.display = 'none';
    savedScoresPanel.style.display = 'none';
    gameRunning = true;
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Generar comida en una posición aleatoria
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Asegurarse de que la comida no aparezca encima de la serpiente
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
            break;
        }
    }
}

// Bucle principal del juego
function gameLoop() {
    if (!gameRunning) return;
    
    moveSnake();
    
    if (isGameOver()) {
        endGame();
        return;
    }
    
    clearCanvas();
    drawFood();
    drawSnake();
}

// Mover la serpiente
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Comprobar si ha comido la comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = `Puntuación: ${score}`;
        generateFood();
    } else {
        // Quitar la cola si no ha comido
        snake.pop();
    }
    
    // Añadir nueva cabeza
    snake.unshift(head);
}

// Comprobar si el juego ha terminado
function isGameOver() {
    const head = snake[0];
    
    // Chocar con los bordes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Chocar consigo mismo (empezar desde 1 porque el 0 es la cabeza)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Terminar el juego
function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    finalScoreDisplay.textContent = `Tu puntuación: ${score}`;
    gameOverDisplay.style.display = 'block';
}

// Limpiar el canvas
function clearCanvas() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Dibujar la comida
function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Dibujar la serpiente
function drawSnake() {
    snake.forEach((part, index) => {
        // Cabeza de color diferente
        ctx.fillStyle = index === 0 ? '#2e8b57' : '#32cd32';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        
        // Borde para cada segmento
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
}

// Control con las teclas
document.addEventListener('keydown', (e) => {
    // Evitar que el juego se reinicie con la barra espaciadora
    if (e.key === " ") {
        e.preventDefault();
    }
    
    // Cambiar dirección según la tecla
    switch(e.key) {
        case 'ArrowUp':
            if (dy !== 1) { // No permitir moverse en dirección opuesta
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// Reiniciar el juego al hacer clic en el botón
restartBtn.addEventListener('click', initGame);

// Guardar puntuación actual
saveScoreBtn.addEventListener('click', saveCurrentScore);

// Ver puntuaciones guardadas
viewScoresBtn.addEventListener('click', () => {
    displaySavedScores();
    savedScoresPanel.style.display = 'block';
});

// Limpiar todas las puntuaciones
clearScoresBtn.addEventListener('click', clearAllScores);

// Volver al juego
backToGameBtn.addEventListener('click', () => {
    savedScoresPanel.style.display = 'none';
});

// Iniciar el juego al cargar la página
window.onload = function() {
    loadSavedScores();
    initGame();
};