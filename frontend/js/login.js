/**
 * login.js - Модуль авторизации через бэкенд
 * Использует mockAPI для отправки запросов на сервер
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('error-message');
    
    // Проверяем, авторизован ли пользователь
    checkAuth();
    
    loginBtn.addEventListener('click', handleLogin);
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    /**
     * Обработчик входа
     */
    async function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            showError('Пожалуйста, заполните все поля');
            return;
        }
        
        // Показываем индикатор загрузки
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        
        try {
            // Проверяем доступность бэкенда
            const isHealthy = await window.mockAPI.checkHealth();
            if (!isHealthy) {
                showError('Бэкенд не отвечает. Запустите Spring Boot.');
                return;
            }
            
            // Отправляем запрос на вход
            const result = await window.mockAPI.login(username, password);
            
            if (result.success) {
                // Успешный вход — перенаправляем на главную
                window.location.href = 'dashboard.html';
            } else {
                showError(result.error || 'Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            showError('Ошибка подключения к серверу');
        } finally {
            // Возвращаем кнопку в исходное состояние
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
        }
    }
    
    /**
     * Отображение ошибки
     */
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Проверка существующей сессии
     */
    function checkAuth() {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // Если сессия не истекла (24 часа)
            if (hoursDiff < 24) {
                window.location.href = 'dashboard.html';
            } else {
                // Просроченная сессия
                localStorage.removeItem('user');
            }
        }
    }
});