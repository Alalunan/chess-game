import { Chess } from 'https://unpkg.com/chess.js@1.0.0-beta.8/chess.js';
import { makeBotMove } from './bot.js'; // Підключаємо логіку бота

const chess = new Chess(); // Ініціалізуємо нову гру
const chessboardContainer = document.getElementById('chessboard-container');
const currentTurnSpan = document.getElementById('current-turn');
const gameStatusSpan = document.getElementById('game-status');
const movesList = document.getElementById('moves-list');
const undoMoveBtn = document.getElementById('undo-move-btn');
const resetGameBtn = document.getElementById('reset-game-btn');

let selectedSquare = null; // Зберігає ID вибраної клітинки (наприклад, 'e2')
let gameMode = 'player-vs-player'; // За замовчуванням
let playerColor = 'white'; // За замовчуванням, можна буде завантажити з налаштувань

// Завантаження режиму гри та налаштувань з URL та localStorage
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('mode')) {
        gameMode = params.get('mode');
    }

    const savedPlayerColor = localStorage.getItem('chess_playerColor');
    if (savedPlayerColor) {
        playerColor = savedPlayerColor;
    }

    renderBoard();
    updateGameInfo();
});

// Функція для візуалізації шахівниці
function renderBoard() {
    chessboardContainer.innerHTML = ''; // Очищаємо дошку перед рендерингом
    const board = chess.board(); // Отримуємо поточний стан дошки

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            const row = 8 - i; // Рядки від 8 до 1
            const colChar = String.fromCharCode(97 + j); // Стовпці від 'a' до 'h'
            const squareId = colChar + row;

            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            square.id = squareId; // Наприклад, 'a1', 'h8'

            const piece = board[i][j];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                // Клас для стилізації фігури, наприклад: 'wP' для білого пішака, 'bK' для чорного короля
                pieceElement.classList.add(`${piece.color}${piece.type.toUpperCase()}`);
                pieceElement.setAttribute('draggable', 'true'); // Дозволити перетягування
                square.appendChild(pieceElement);
            }

            square.addEventListener('click', handleSquareClick);
            // Додати обробники для Drag and Drop (пізніше)
            square.addEventListener('dragover', (e) => e.preventDefault());
            square.addEventListener('drop', handleDrop);
            if (piece) {
                square.querySelector('.piece').addEventListener('dragstart', handleDragStart);
            }

            chessboardContainer.appendChild(square);
        }
    }
}

// Обробник кліку на клітинку
function handleSquareClick(event) {
    const clickedSquare = event.currentTarget;
    const squareId = clickedSquare.id;

    // Якщо клітинка вже вибрана
    if (selectedSquare) {
        // Спроба зробити хід
        const moveAttempt = {
            from: selectedSquare,
            to: squareId,
            promotion: 'q' // Промоція пішака в ферзя за замовчуванням
        };

        try {
            const moveResult = chess.move(moveAttempt);
            if (moveResult) {
                // Хід успішний
                renderBoard();
                updateGameInfo();
                selectedSquare = null;
                clearHighlights();

                // Якщо гра з ботом і хід гравця був успішним, хід бота
                if (gameMode === 'player-vs-bot' && chess.turn() !== (playerColor === 'white' ? 'w' : 'b')) {
                    setTimeout(() => { // Невеликий таймаут для візуального ефекту
                        makeBotMove(chess, playerColor);
                        renderBoard();
                        updateGameInfo();
                    }, 500);
                }
            } else {
                // Недопустимий хід, можливо, переобрали фігуру
                const pieceAtClickedSquare = chess.get(squareId);
                if (pieceAtClickedSquare && pieceAtClickedSquare.color === chess.turn()) {
                    // Переобрали свою фігуру
                    selectedSquare = squareId;
                    clearHighlights();
                    highlightPossibleMoves(squareId);
                } else {
                    // Просто невірний хід
                    console.log('Недопустимий хід!');
                    clearHighlights();
                    selectedSquare = null;
                }
            }
        } catch (e) {
            console.error('Помилка ходу:', e);
            clearHighlights();
            selectedSquare = null;
        }

    } else {
        // Вибрали першу клітинку з фігурою
        const piece = chess.get(squareId);
        if (piece && piece.color === chess.turn()) {
            selectedSquare = squareId;
            highlightPossibleMoves(squareId);
        }
    }
}

// Функції для Drag and Drop (розширити пізніше)
function handleDragStart(event) {
    const parentSquare = event.target.closest('.square');
    if (parentSquare) {
        event.dataTransfer.setData('text/plain', parentSquare.id);
        selectedSquare = parentSquare.id; // Встановлюємо вибрану клітинку
        highlightPossibleMoves(selectedSquare);
    }
}

function handleDrop(event) {
    event.preventDefault();
    const fromSquare = event.dataTransfer.getData('text/plain');
    const toSquare = event.currentTarget.id;

    if (fromSquare && toSquare) {
        const moveAttempt = {
            from: fromSquare,
            to: toSquare,
            promotion: 'q'
        };

        try {
            const moveResult = chess.move(moveAttempt);
            if (moveResult) {
                renderBoard();
                updateGameInfo();
                selectedSquare = null;
                clearHighlights();

                if (gameMode === 'player-vs-bot' && chess.turn() !== (playerColor === 'white' ? 'w' : 'b')) {
                    setTimeout(() => {
                        makeBotMove(chess, playerColor);
                        renderBoard();
                        updateGameInfo();
                    }, 500);
                }
            } else {
                console.log('Недопустимий хід (drag/drop)!');
                clearHighlights();
                selectedSquare = null;
            }
        } catch (e) {
            console.error('Помилка ходу (drag/drop):', e);
            clearHighlights();
            selectedSquare = null;
        }
    }
}


// Підсвічування можливих ходів
function highlightPossibleMoves(squareId) {
    clearHighlights(); // Скинути попередні підсвічування
    document.getElementById(squareId).classList.add('selected'); // Підсвітити вибрану фігуру

    const moves = chess.moves({ square: squareId, verbose: true });
    moves.forEach(move => {
        const targetSquare = document.getElementById(move.to);
        if (targetSquare) {
            targetSquare.classList.add('possible-move');
        }
    });
}

// Очищення підсвічування
function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'possible-move', 'attacked');
    });
}

// Оновлення інформації про гру
function updateGameInfo() {
    currentTurnSpan.textContent = chess.turn() === 'w' ? 'Білі' : 'Чорні';

    gameStatusSpan.textContent = ''; // Очистити попередній статус
    if (chess.inCheck()) {
        gameStatusSpan.textContent = 'Шах!';
        // Можна підсвітити короля, що знаходиться під шахом
        const kingSquare = findKingSquare(chess.turn());
        if (kingSquare) {
            document.getElementById(kingSquare).classList.add('attacked');
        }
    }

    if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
            gameStatusSpan.textContent = `Мат! Перемогли ${chess.turn() === 'w' ? 'Чорні' : 'Білі'}!`;
            alert(`Мат! Перемогли ${chess.turn() === 'w' ? 'Чорні' : 'Білі'}!`);
        } else if (chess.isDraw()) {
            gameStatusSpan.textContent = 'Нічия!';
            alert('Нічия! Гра завершена.');
        } else if (chess.isStalemate()) {
            gameStatusSpan.textContent = 'Пат! Нічия.';
            alert('Пат! Нічия.');
        } else if (chess.isThreefoldRepetition()) {
            gameStatusSpan.textContent = 'Нічия за правилом трьох повторень.';
            alert('Нічия за правилом трьох повторень.');
        } else if (chess.isInsufficientMaterial()) {
            gameStatusSpan.textContent = 'Нічия через недостатність матеріалу.';
            alert('Нічия через недостатність матеріалу.');
        }
    }

    updateMoveHistory();
}

// Функція для пошуку позиції короля (для підсвічування шаху)
function findKingSquare(color) {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === 'k' && piece.color === color) {
                return String.fromCharCode(97 + c) + (8 - r);
            }
        }
    }
    return null;
}


// Оновлення історії ходів
function updateMoveHistory() {
    movesList.innerHTML = '';
    const history = chess.history({ verbose: true }); // Отримуємо повну історію ходів

    history.forEach((move, index) => {
        const moveItem = document.createElement('li');
        moveItem.textContent = `${move.color === 'w' ? 'Білі' : 'Чорні'}: ${move.from}-${move.to} ${move.san}`;
        movesList.appendChild(moveItem);
    });
    // Прокручуємо до останнього ходу
    movesList.scrollTop = movesList.scrollHeight;
}

// Обробники кнопок керування
undoMoveBtn.addEventListener('click', () => {
    chess.undo();
    renderBoard();
    updateGameInfo();
    clearHighlights();
    selectedSquare = null;
    // Якщо гра з ботом і відмінили хід бота, відмінити ще один
    if (gameMode === 'player-vs-bot' && chess.history().length % 2 !== 0) { // Якщо поточний хід після відміни належить гравцеві
         chess.undo();
         renderBoard();
         updateGameInfo();
    }
});

resetGameBtn.addEventListener('click', () => {
    chess.reset();
    renderBoard();
    updateGameInfo();
    clearHighlights();
    selectedSquare = null;
});

// Експортуємо chess об'єкт для використання ботом
export { chess, renderBoard, updateGameInfo, playerColor, gameMode };
