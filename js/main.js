document.addEventListener('DOMContentLoaded', () => {
    // Обробник для кнопок "До меню" на інших сторінках
    const backToMenuButtons = document.querySelectorAll('[id^="back-to-menu-btn"]');
    if (backToMenuButtons) {
        backToMenuButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        });
    }

    // Логіка для сторінки налаштувань
    if (window.location.pathname.endsWith('settings.html')) {
        const botDifficultySelect = document.getElementById('bot-difficulty');
        const playerColorSelect = document.getElementById('player-color');
        const soundEffectsCheckbox = document.getElementById('sound-effects');
        const saveSettingsBtn = document.getElementById('save-settings-btn');

        // Завантаження збережених налаштувань
        const savedDifficulty = localStorage.getItem('chess_botDifficulty');
        if (savedDifficulty) {
            botDifficultySelect.value = savedDifficulty;
        }
        const savedPlayerColor = localStorage.getItem('chess_playerColor');
        if (savedPlayerColor) {
            playerColorSelect.value = savedPlayerColor;
        }
        const savedSoundEffects = localStorage.getItem('chess_soundEffects');
        if (savedSoundEffects !== null) {
            soundEffectsCheckbox.checked = JSON.parse(savedSoundEffects);
        }

        // Збереження налаштувань
        saveSettingsBtn.addEventListener('click', () => {
            localStorage.setItem('chess_botDifficulty', botDifficultySelect.value);
            localStorage.setItem('chess_playerColor', playerColorSelect.value);
            localStorage.setItem('chess_soundEffects', soundEffectsCheckbox.checked);
            alert('Налаштування збережено!');
        });
    }
});
