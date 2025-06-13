// Утилиты для коммуникации с родительским приложением
console.log('Initializing game utils...');

if (window.gameUtils) {
    console.warn('gameUtils already exists, overwriting...');
}

window.gameUtils = {
    // Отправка сообщения в родительское приложение
    sendToParent: function(type, data) {
        if (window.parent && window.parent !== window) {
            console.log('Sending message to parent:', { type, data });
            window.parent.postMessage({
                type: type,
                message: data
            }, window.location.origin);
        } else {
            console.warn('Cannot send message: no parent window or same window');
        }
    },

    // Отправка лога в консоль родительского приложения
    log: function(message) {
        this.sendToParent('console', message);
    },

    // Открытие задачи в родительском приложении
    openTask: function(taskId) {
        console.log('Opening task:', taskId);
        this.sendToParent('openTask', taskId);
    }
};

console.log('Game utils initialized:', window.gameUtils);

// Переопределяем console.log для автоматической отправки логов
