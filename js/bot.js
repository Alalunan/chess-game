// js/bot.js
import { chess, renderBoard, updateGameInfo } from './game.js';

export function makeBotMove(game, playerColor) {
    const savedDifficulty = localStorage.getItem('chess_botDifficulty') || 'easy';
    const botColor = playerColor === 'white' ? 'b' : 'w';

    if (game.turn() !== botColor) {
        return; // Хід не бота
    }

    const possibleMoves = game.moves({ verbose: true });

    if (possibleMoves.length === 0) {
        return; // Немає можливих ходів
    }

    let chosenMove = null;

    switch (savedDifficulty) {
        case 'easy':
            // Легкий бот: Вибирає випадковий дозволений хід
            chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            break;
        case 'medium':
            // Середній бот: (Дуже спрощено) Може віддати перевагу взяттю фігури,
            // інакше випадковий хід. Потребує значного розширення для реального ШІ.
            const capturingMoves = possibleMoves.filter(move => move.flags.includes('c')); // 'c' для capture
            if (capturingMoves.length > 0) {
                chosenMove = capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
            } else {
                chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
            break;
        case 'hard':
            // Складний бот: Це місце для реалізації алгоритму мінімакс з альфа-бета відсіченням.
            // Для цього потрібна окрема складна реалізація.
            // Наразі для демонстрації, він буде як середній.
            console.log("Складний бот ще не реалізований повністю, виконує випадковий хід.");
            chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            break;
    }

    if (chosenMove) {
        game.move(chosenMove);
        renderBoard();
        updateGameInfo();
    }
}

// Функції для більш складного ШІ (мінімакс, оцінка позиції) потребуватимуть окремого файлу
// або розширення цього файлу. Це виходить за рамки базового шаблону.
