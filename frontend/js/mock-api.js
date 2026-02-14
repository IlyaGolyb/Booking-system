/**
 * mock-api.js - Клиент для взаимодействия с Spring Boot бэкендом
 * Все запросы к REST API проходят через этот модуль
 */

// Базовый URL бэкенда
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Класс для работы с API бэкенда
 * Содержит методы для всех операций: авторизация, бронирования, рабочие места
 */
class MockAPI {
    constructor() {
        console.log('Подключение к бэкенду:', API_BASE_URL);
        this.currentUser = null;
    }

    // ============= АВТОРИЗАЦИЯ =============
    
    /**
     * Отправляет запрос на вход в систему
     * @param {string} username - логин пользователя
     * @param {string} password - пароль
     * @returns {Promise<Object>} результат с флагом success и данными пользователя
     */
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const userData = {
                    username: result.username,
                    name: result.name,
                    role: result.role,
                    email: result.email,
                    loggedIn: true,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, user: userData };
            }
            
            return result;
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: error.message };
        }
    }

    // ============= РАБОЧИЕ МЕСТА =============
    
    /**
     * Получает список рабочих мест для указанного филиала
     * @param {string} branch - 'moscow' или 'spb'
     * @returns {Promise<Array>} массив объектов рабочих мест
     */
    async getWorkplaces(branch) {
        try {
            const response = await fetch(`${API_BASE_URL}/workplaces?branch=${branch}`);
            if (!response.ok) throw new Error('Ошибка загрузки рабочих мест');
            const workplaces = await response.json();
            console.log(`Загружено ${workplaces.length} мест для филиала ${branch}`);
            return workplaces;
        } catch (error) {
            console.error('Ошибка получения рабочих мест:', error);
            return [];
        }
    }

    /**
     * Получает все бронирования для конкретного места (для блока "Занятые слоты")
     * @param {string} workplaceId - ID рабочего места
     * @returns {Promise<Array>} массив бронирований
     */
    async getBookingsByPlace(workplaceId) {
        try {
            console.log(`Запрос бронирований для места: ${workplaceId}`);
            const response = await fetch(`${API_BASE_URL}/bookings/by-place?workplaceId=${workplaceId}`);
            
            if (!response.ok) {
                console.error('Ошибка ответа:', response.status);
                return [];
            }
            
            const bookings = await response.json();
            console.log(`Загружено ${bookings.length} бронирований для места ${workplaceId}`);
            return bookings;
        } catch (error) {
            console.error('Ошибка загрузки бронирований места:', error);
            return [];
        }
    }

    // ============= БРОНИРОВАНИЯ =============
    
    /**
     * Получает бронирования конкретного пользователя
     * @param {string} userId - ID пользователя (admin, user, employee1)
     * @returns {Promise<Array>} массив бронирований пользователя
     */
    async getMyBookings(userId) {
        try {
            console.log(`Запрос бронирований для userId: ${userId}`);
            
            const url = `${API_BASE_URL}/bookings?userId=${encodeURIComponent(userId)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Ошибка ответа:', response.status);
                return [];
            }
            
            const bookings = await response.json();
            console.log(`Получено ${bookings.length} бронирований для ${userId}:`, bookings);
            return bookings;
            
        } catch (error) {
            console.error('Ошибка загрузки бронирований:', error);
            return [];
        }
    }

    /**
     * Создаёт новое бронирование
     * @param {Object} bookingData - данные бронирования
     * @returns {Promise<Object>} результат с success и id созданной брони
     */
    async createBooking(bookingData) {
        try {
            const userJson = localStorage.getItem('user');
            if (!userJson) {
                throw new Error('Пользователь не авторизован');
            }
            
            const user = JSON.parse(userJson);
            console.log('Текущий пользователь из localStorage:', user);
            
            let userId = user.username;
            
            // Защита от неверных данных (на случай, если username не задан)
            if (!userId) {
                userId = user.name?.toLowerCase().includes('администратор') ? 'admin' : 
                        user.name?.toLowerCase().includes('иван') ? 'user' :
                        user.name?.toLowerCase().includes('мария') ? 'employee1' : 
                        'unknown';
            }
            
            console.log('Отправляемый userId:', userId);
            
            const booking = {
                ...bookingData,
                userId: userId,
                status: 'confirmed',
                id: null
            };
            
            console.log('Полные данные бронирования:', booking);
            
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });

            const result = await response.json();
            console.log('Ответ сервера:', result);
            return result;
            
        } catch (error) {
            console.error('Ошибка бронирования:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Отменяет бронирование по ID
     * @param {string} bookingId - ID бронирования
     * @returns {Promise<Object>} результат операции
     */
    async cancelBooking(bookingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Ошибка отмены бронирования');
            
            const result = await response.json();
            console.log('Бронирование отменено:', result);
            return result;
        } catch (error) {
            console.error('Ошибка отмены:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Проверяет доступность места на указанное время
     * @param {string} workplaceId - ID места
     * @param {string} date - дата в формате ДД.ММ.ГГГГ
     * @param {string} startTime - время начала
     * @param {string} endTime - время окончания
     * @returns {Promise<Object>} результат с полем available
     */
    async checkAvailability(workplaceId, date, startTime, endTime) {
        try {
            console.log('Проверка доступности:', { workplaceId, date, startTime, endTime });
            
            const url = new URL(`${API_BASE_URL}/bookings/check-availability`);
            url.searchParams.append('workplaceId', workplaceId);
            url.searchParams.append('date', date);
            url.searchParams.append('startTime', startTime);
            url.searchParams.append('endTime', endTime);

            const response = await fetch(url);
            if (!response.ok) {
                console.error('Ошибка ответа:', response.status);
                return { available: false, error: 'Ошибка сервера' };
            }
            
            const result = await response.json();
            console.log('Результат проверки:', result);
            return result;
        } catch (error) {
            console.error('Ошибка проверки:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Обёртка для getWorkplaces (для совместимости)
     * @deprecated Используйте getWorkplaces напрямую
     */
    async getWorkplacesByBranch(branch) {
        return this.getWorkplaces(branch);
    }

    // ============= ПРОВЕРКА =============
    
    /**
     * Проверяет доступность бэкенда
     * @returns {Promise<boolean>} true если бэкенд отвечает
     */
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Создаём глобальный экземпляр для доступа из других скриптов
window.mockAPI = new MockAPI();

// При загрузке страницы проверяем, доступен ли бэкенд
document.addEventListener('DOMContentLoaded', async () => {
    const isHealthy = await window.mockAPI.checkHealth();
    if (isHealthy) {
        console.log('Бэкенд HDFS доступен');
    } else {
        console.warn('Бэкенд не отвечает, проверьте что Spring Boot запущен на порту 8080');
    }
});