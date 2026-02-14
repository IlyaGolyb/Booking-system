/**
 * Класс Dashboard - основной контроллер главной страницы
 * Управляет всем интерфейсом бронирования: формами, списками, бронированиями
 */
class Dashboard {
    /**
     * Конструктор - инициализация всех полей и запуск приложения
     */
    constructor() {
        // Данные пользователя
        this.user = null;
        
        // Текущая дата и время
        this.currentDate = new Date();
        
        // ID выбранного рабочего места
        this.selectedResource = null;
        this.bookingDate = null;
        
        // Время бронирования
        this.startTime = '09:00';
        this.endTime = '10:00';
        
        // Текущий филиал и фильтры
        this.currentBranch = 'moscow';
        this.bookingsBranchFilter = 'all';  // Фильтр в "Мои бронирования"
        
        // Запуск инициализации
        this.init();
    }
    
    /**
     * Инициализация всех компонентов страницы
     */
    init() {
        this.checkAuth();               // Проверка авторизации
        this.loadUserInfo();             // Загрузка данных пользователя
        this.setupEventListeners();       // Настройка обработчиков событий
        this.initializeTimeSelectors();   // Заполнение выпадающих списков времени
        this.initializeDatePicker();      // Инициализация календаря
        this.loadWorkplaces();            // Загрузка списка рабочих мест
        this.loadUserBookings();          // Загрузка бронирований пользователя
        this.setupBranchChange();         // Обработчик смены филиала
    }
    
    /**
     * Проверка авторизации пользователя
     * Если нет данных в localStorage - перенаправляет на страницу входа
     */
    checkAuth() {
        const userData = localStorage.getItem('user');
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }
        
        this.user = JSON.parse(userData);
        
        // Проверка срока сессии (24 часа)
        const loginTime = new Date(this.user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }

    /**
     * Отображение информации о пользователе в боковой панели
     */
    loadUserInfo() {
        if (!this.user) return;
        
        const userInfoDiv = document.getElementById('user-info');
        if (!userInfoDiv) return;
        
        userInfoDiv.innerHTML = `
            <div>
                <span class="label">Имя:</span>
                <span class="value">${this.user.name || 'Не указано'}</span>
            </div>
            <div>
                <span class="label">Роль:</span>
                <span class="value">${this.user.role === 'admin' ? 'Администратор' : 'Сотрудник'}</span>
            </div>
            <div>
                <span class="label">Email:</span>
                <span class="value">${this.user.email || 'Не указан'}</span>
            </div>
            <div>
                <span class="label">Вошел:</span>
                <span class="value">${new Date().toLocaleString('ru-RU')}</span>
            </div>
        `;
        
        document.getElementById('username-display').textContent = this.user.name || 'Гость';
    }
    
    /**
     * Загрузка бронирований текущего пользователя с бэкенда
     */
    async loadUserBookings() {
        if (!this.user) return;
        
        try {
            console.log('Загрузка бронирований для пользователя:', this.user.username);
            const bookings = await window.mockAPI.getMyBookings(this.user.username);
            console.log(`Получено бронирований: ${bookings.length}`, bookings);
            this.displayBookings(bookings);
        } catch (error) {
            console.error('Ошибка загрузки бронирований:', error);
            this.displayBookings([]);
        }
    }
    
    /**
     * Настройка всех обработчиков событий на странице
     */
    setupEventListeners() {
        // Выход из системы
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
        
        // Выбор типа ресурса (рабочее место/переговорная/конференц-зал)
        document.querySelectorAll('input[name="resourceType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateResourceList(e.target.value);
                document.getElementById('book-btn').classList.remove('visible');
                document.getElementById('place-bookings-card').style.display = 'none';
            });
        });
        
        // Выбор конкретного места из выпадающего списка
        document.getElementById('resource-select').addEventListener('change', (e) => {
            this.selectedResource = e.target.value;
            this.highlightSelectedResource();
            document.getElementById('book-btn').classList.remove('visible');

            this.loadPlaceBookings(this.selectedResource);
        });
        
        // Кнопка проверки доступности
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkAvailability();
        });
        
        // Кнопка бронирования (изначально скрыта)
        document.getElementById('book-btn').addEventListener('click', () => {
            this.showBookingConfirmation();
        });
        
        // Модальное окно подтверждения
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('cancel-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('confirm-booking').addEventListener('click', () => {
            this.confirmBooking();
        });
        
        // Закрытие модального окна по клику вне его
        document.getElementById('booking-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('booking-modal')) {
                this.closeModal();
            }
        });
        
        // Изменение даты или времени сбрасывает проверку доступности
        document.getElementById('booking-date').addEventListener('change', () => {
            document.getElementById('book-btn').classList.remove('visible');
        });
        
        document.getElementById('start-time').addEventListener('change', () => {
            document.getElementById('book-btn').classList.remove('visible');
        });
        
        document.getElementById('end-time').addEventListener('change', () => {
            document.getElementById('book-btn').classList.remove('visible');
        });
        
        // Фильтр бронирований по филиалу
        document.getElementById('bookings-branch-filter').addEventListener('change', (e) => {
            this.bookingsBranchFilter = e.target.value;
            this.loadUserBookings();
        });
    }
    
    /**
     * Обработчик смены филиала
     * Загружает новые рабочие места и обновляет интерфейс
     */
    setupBranchChange() {
        const branchSelect = document.getElementById('branch-select');
        branchSelect.addEventListener('change', async (e) => {
            this.currentBranch = e.target.value;
            
            // Загружаем новые рабочие места
            await this.loadWorkplaces();
            
            // Обновляем карту и заголовок
            this.updateBranchDisplay();
            
            // Обновляем выпадающий список
            this.updateResourceList(document.querySelector('input[name="resourceType"]:checked').value);
            
            // Сбрасываем выбранное место
            this.selectedResource = null;
            document.getElementById('resource-select').value = '';
            document.getElementById('book-btn').classList.remove('visible');
            document.getElementById('place-bookings-card').style.display = 'none';
        });
    }
    
    /**
     * Обновление отображения карты при смене филиала
     */
    updateBranchDisplay() {
        const branchName = this.currentBranch === 'moscow' ? 'Москва' : 'Санкт-Петербург';
        document.getElementById('map-title').textContent = `План офиса ${branchName}`;
        
        if (window.officeMap) {
            window.officeMap.changeBranch(this.currentBranch);
        }
    }
    
    /**
     * Инициализация выпадающих списков времени начала и окончания
     * Создаёт слоты с 9:00 до 18:00 с шагом 30 минут
     */
    initializeTimeSelectors() {
        const startSelect = document.getElementById('start-time');
        const endSelect = document.getElementById('end-time');
        
        startSelect.innerHTML = '';
        endSelect.innerHTML = '';
        
        // Генерация временных слотов
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                // Не создаём слот 18:30
                if (hour === 18 && minute === 30) continue;
                
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                // Добавление в список начала
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                
                if (time === '09:00') {
                    option.selected = true;
                    this.startTime = time;
                }
                
                startSelect.appendChild(option);
                
                // Добавление в список окончания (кроме последнего слота)
                if (!(hour === 18 && minute === 30)) {
                    if (hour === 18 && minute === 0) continue;
                    
                    const endHour = minute === 30 ? hour + 1 : hour;
                    const endMinute = minute === 30 ? 0 : 30;
                    
                    if (endHour > 18) continue;
                    if (endHour === 18 && endMinute > 0) continue;
                    
                    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                    
                    const endOption = document.createElement('option');
                    endOption.value = endTime;
                    endOption.textContent = endTime;
                    
                    if (endTime === '10:00') {
                        endOption.selected = true;
                        this.endTime = endTime;
                    }
                    
                    endSelect.appendChild(endOption);
                }
            }
        }
        
        // Обновление выбранного времени при изменении
        startSelect.addEventListener('change', (e) => {
            this.startTime = e.target.value;
        });
        
        endSelect.addEventListener('change', (e) => {
            this.endTime = e.target.value;
        });
    }
    
    /**
     * Инициализация календаря для выбора даты (flatpickr)
     */
    initializeDatePicker() {
        const datePicker = flatpickr('#booking-date', {
            locale: 'ru',
            dateFormat: 'd.m.Y',           // Формат даты ДД.ММ.ГГГГ
            minDate: 'today',
            defaultDate: 'today',
            disable: [
                function(date) {
                    // Отключаем выходные
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            onChange: (selectedDates) => {
                if (selectedDates[0]) {
                    const selectedDate = selectedDates[0];
                    const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    this.bookingDate = localDate;
                    this.formatDateForDisplay();
                }
            }
        });
        
        // Устанавливаем текущую дату
        const today = new Date();
        const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        this.bookingDate = localToday;
        this.formatDateForDisplay();
    }
    
    /**
     * Форматирует и отображает выбранную дату
     */
    formatDateForDisplay() {
        if (this.bookingDate) {
            const formatted = this.bookingDate.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            document.getElementById('booking-date').value = formatted;
        }
    }
    
    /**
     * Загрузка списка рабочих мест с бэкенда
     */
    async loadWorkplaces() {
        try {
            const branch = this.currentBranch || 'moscow';
            this.workplaces = await window.mockAPI.getWorkplaces(branch);
            console.log(`Загружено ${this.workplaces.length} мест для филиала ${branch}`);
            this.updateResourceList(this.selectedResourceType || 'workplace');
        } catch (error) {
            console.error('Ошибка загрузки рабочих мест:', error);
        }
    }
    
    /**
     * Обновление выпадающего списка мест в зависимости от выбранного типа
     * @param {string} type - тип места (workplace/negotiation/conference)
     */
    async updateResourceList(type) {
        const select = document.getElementById('resource-select');
        select.innerHTML = '<option value="">-- Выберите место --</option>';
        
        const workplaces = this.workplaces || [];
        let filtered = [];
        
        if (type === 'workplace') {
            filtered = workplaces.filter(wp => wp.type === 'workplace');
        } else if (type === 'negotiation') {
            filtered = workplaces.filter(wp => wp.type === 'negotiation');
        } else if (type === 'conference') {
            filtered = workplaces.filter(wp => wp.type === 'conference');
        }
        
        filtered.forEach(wp => {
            const option = document.createElement('option');
            option.value = wp.id;
            
            if (wp.type === 'workplace') {
                option.textContent = `${wp.name} (${wp.number})`;
            } else {
                option.textContent = `${wp.name} - до ${wp.capacity} чел.`;
            }
            
            select.appendChild(option);
        });
        
        if (filtered.length > 0) {
            this.selectedResource = filtered[0].id;
            select.value = this.selectedResource;
            this.highlightSelectedResource();
            
            this.loadPlaceBookings(this.selectedResource);
        }
    }
    
    /**
     * Подсветка выбранного места на карте
     */
    highlightSelectedResource() {
        if (window.officeMap) {
            window.officeMap.highlightWorkplace(this.selectedResource);
        }
    }
    
    /**
     * Загрузка бронирований пользователя (обёртка)
     */
    async loadUserBookings() {
        if (!this.user) return;
        
        try {
            const bookings = await window.mockAPI.getMyBookings(this.user.username);
            this.displayBookings(bookings);
        } catch (error) {
            console.error('Ошибка загрузки бронирований:', error);
            this.displayBookings([]);
        }
    }

    /**
     * Переключение филиала (метод для внешнего вызова)
     */
    async changeBranch(branch) {
        console.log('Переключение на филиал:', branch);
        this.currentBranch = branch;
        
        await this.loadWorkplaces();
        this.updateResourceList(this.selectedResourceType || 'workplace');
        
        this.selectedResource = null;
        document.getElementById('resource-select').value = '';
        document.getElementById('book-btn').classList.remove('visible');
    }
    
    /**
     * Отображение списка бронирований в боковой панели
     * @param {Array} bookings - массив бронирований
     */
    displayBookings(bookings) {
        const container = document.getElementById('my-bookings');
        
        if (!container) {
            console.error('Контейнер my-bookings не найден');
            return;
        }
        
        console.log('Отображение бронирований:', bookings);
        
        // Фильтрация по филиалу
        let filteredBookings = bookings;
        if (this.bookingsBranchFilter !== 'all') {
            filteredBookings = bookings.filter(booking => 
                booking.branch === this.bookingsBranchFilter
            );
        }
        
        if (!filteredBookings || filteredBookings.length === 0) {
            const message = this.bookingsBranchFilter === 'all' 
                ? 'У вас пока нет бронирований' 
                : `У вас нет бронирований в филиале ${this.bookingsBranchFilter === 'moscow' ? 'Москва' : 'Санкт-Петербург'}`;
            container.innerHTML = `<div class="empty-message">${message}</div>`;
            return;
        }
        
        container.innerHTML = filteredBookings.map(booking => `
            <div class="booking-item" data-booking-id="${booking.id}">
                <div class="booking-header">
                    <span class="booking-resource">${booking.workplaceName || 'Неизвестно'}</span>
                    <div style="display: flex; gap: 8px;">
                        <span class="booking-branch">${booking.branch === 'moscow' ? 'Москва' : 'СПб'}</span>
                        <span class="booking-status ${booking.status}">
                            ${booking.status === 'confirmed' ? 'Подтверждено' : 'Отменено'}
                        </span>
                    </div>
                </div>
                <div class="booking-details">
                    <div><i class="far fa-calendar"></i> ${booking.date || 'Нет даты'}</div>
                    <div><i class="far fa-clock"></i> ${booking.startTime || '??'} - ${booking.endTime || '??'}</div>
                    ${booking.purpose ? `<div><i class="far fa-sticky-note"></i> ${booking.purpose}</div>` : ''}
                </div>
                ${booking.status === 'confirmed' ? 
                    `<button class="btn-cancel" data-id="${booking.id}">
                        <i class="fas fa-times"></i> Отменить
                    </button>` : ''}
            </div>
        `).join('');
        
        // Добавление обработчиков для кнопок отмены
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.btn-cancel').getAttribute('data-id');
                this.cancelBooking(bookingId);
            });
        });
    }
    
    /**
     * Проверка доступности выбранного места на указанное время
     */
    async checkAvailability() {
        document.getElementById('book-btn').classList.remove('visible');
        
        if (!this.validateForm()) return;
        
        try {
            const date = document.getElementById('booking-date').value;
            const startTime = document.getElementById('start-time').value;
            const endTime = document.getElementById('end-time').value;
            
            console.log('Отправка запроса на проверку:', {
                workplaceId: this.selectedResource,
                date,
                startTime,
                endTime
            });
            
            const result = await window.mockAPI.checkAvailability(
                this.selectedResource,
                date,
                startTime,
                endTime
            );
            
            const statusDiv = document.getElementById('status-message');
            
            if (result.available) {
                statusDiv.className = 'status-message success';
                statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Место доступно для бронирования!';
                document.getElementById('book-btn').classList.add('visible');
            } else {
                statusDiv.className = 'status-message error';
                statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> Место занято в выбранное время. Пожалуйста, выберите другое время или место.';
            }
        } catch (error) {
            console.error('Ошибка при проверке:', error);
            const statusDiv = document.getElementById('status-message');
            statusDiv.className = 'status-message error';
            statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка при проверке доступности';
        }
    }
    
    /**
     * Валидация формы перед проверкой доступности
     * @returns {boolean} true - форма валидна, false - есть ошибки
     */
    validateForm() {
        const errors = [];
        
        if (!this.selectedResource) {
            errors.push('Выберите рабочее место, переговорную или конференц-зал');
        }
        
        if (!this.bookingDate) {
            errors.push('Выберите дату бронирования');
        }
        
        if (!this.startTime || !this.endTime) {
            errors.push('Выберите время начала и окончания');
        }
        
        const start = this.timeToMinutes(this.startTime);
        const end = this.timeToMinutes(this.endTime);
        
        if (start < 9 * 60) {
            errors.push('Бронирование возможно с 9:00');
        }
        
        if (end > 18 * 60) {
            errors.push('Бронирование возможно до 18:00');
        }
        
        if (start >= end) {
            errors.push('Время окончания должно быть позже времени начала');
        }
        
        if ((end - start) < 30) {
            errors.push('Минимальное время бронирования - 30 минут');
        }
        
        if (errors.length > 0) {
            const statusDiv = document.getElementById('status-message');
            statusDiv.className = 'status-message error';
            statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errors.join('<br>')}`;
            return false;
        }
        
        return true;
    }
    
    /**
     * Показ модального окна подтверждения бронирования
     */
    async showBookingConfirmation() {
        if (!this.selectedResource) {
            alert('Пожалуйста, выберите место для бронирования');
            return;
        }
        
        const workplace = this.workplaces.find(wp => wp.id === this.selectedResource);
        
        if (!workplace) {
            alert('Ошибка: выбранное место не найдено');
            return;
        }
        
        const date = document.getElementById('booking-date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const purpose = document.getElementById('purpose').value || 'Без цели';
        
        if (!date || !startTime || !endTime) {
            alert('Пожалуйста, выберите дату и время');
            return;
        }
        
        const modal = document.getElementById('booking-modal');
        const modalDetails = document.getElementById('modal-details');
        
        modalDetails.innerHTML = `
            <div class="booking-summary">
                <h4><i class="fas fa-check-circle"></i> Подтвердите бронирование</h4>
                <div class="summary-item">
                    <strong>Место:</strong>
                    <span>${workplace.name}</span>
                </div>
                <div class="summary-item">
                    <strong>Дата:</strong>
                    <span>${date}</span>
                </div>
                <div class="summary-item">
                    <strong>Время:</strong>
                    <span>${startTime} - ${endTime}</span>
                </div>
                <div class="summary-item">
                    <strong>Цель:</strong>
                    <span>${purpose}</span>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        this.pendingBooking = {
            workplaceId: workplace.id,
            workplaceName: workplace.name,
            branch: workplace.branch,
            date: date,
            startTime: startTime,
            endTime: endTime,
            purpose: purpose
        };
    }
    
    /**
     * Расчет длительности бронирования в минутах
     * @returns {number} количество минут
     */
    calculateDuration() {
        const start = this.timeToMinutes(this.startTime);
        const end = this.timeToMinutes(this.endTime);
        return end - start;
    }
    
    /**
     * Открытие модального окна
     */
    openModal() {
        document.getElementById('booking-modal').style.display = 'flex';
    }
    
    /**
     * Закрытие модального окна
     */
    closeModal() {
        document.getElementById('booking-modal').style.display = 'none';
    }
    
    /**
     * Подтверждение и отправка бронирования на бэкенд
     */
    async confirmBooking() {
        if (!this.pendingBooking) return;
        
        const bookingData = {
            ...this.pendingBooking,
        };
        
        const result = await window.mockAPI.createBooking(bookingData);
        
        if (result.success) {
            this.showSuccess('Бронирование успешно создано!');
            document.getElementById('booking-modal').style.display = 'none';
            this.loadUserBookings();

            await this.loadPlaceBookings(this.selectedResource);

            this.resetForm();
        } else {
            alert('Ошибка при создании бронирования: ' + (result.error || 'Неизвестная ошибка'));
            this.closeModal();
        }
    }
    
    /**
     * Отмена бронирования
     * @param {string} bookingId - ID бронирования
     */
    async cancelBooking(bookingId) {
        if (!confirm('Вы уверены, что хотите отменить это бронирование?')) {
            return;
        }
        
        try {
            console.log('Отмена бронирования:', bookingId);
            const result = await window.mockAPI.cancelBooking(bookingId);
            
            if (result.success) {
                this.showSuccess('Бронирование успешно отменено');
                
                await this.loadUserBookings();
                
                await this.loadPlaceBookings(this.selectedResource);

                if (window.officeMap) {
                    window.officeMap.loadWorkplaces();
                }
            } else {
                this.showError(result.error || 'Ошибка при отмене бронирования');
            }
        } catch (error) {
            console.error('Ошибка отмены:', error);
            this.showError('Ошибка при отмене бронирования');
        }
    }
    
    /**
     * Сброс формы после успешного бронирования
     */
    resetForm() {
        document.getElementById('purpose').value = '';
        document.getElementById('status-message').className = 'status-message';
        document.getElementById('status-message').innerHTML = '';
        document.getElementById('book-btn').classList.remove('visible');
    }
    
    /**
     * Отображение сообщения об успехе
     * @param {string} message - текст сообщения
     */
    showSuccess(message) {
        const statusDiv = document.getElementById('status-message');
        statusDiv.className = 'status-message success';
        statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        setTimeout(() => {
            statusDiv.className = 'status-message';
            statusDiv.innerHTML = '';
        }, 5000);
    }
    
    /**
     * Отображение сообщения об ошибке
     * @param {string} message - текст сообщения
     */
    showError(message) {
        const statusDiv = document.getElementById('status-message');
        statusDiv.className = 'status-message error';
        statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
    }
    
    /**
     * Форматирование даты для отправки на бэкенд (не используется сейчас)
     * @deprecated Бэкенд ожидает формат ДД.ММ.ГГГГ
     */
    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Преобразование времени в минуты от полуночи
     * @param {string} time - время в формате ЧЧ:ММ
     * @returns {number} количество минут
     */
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Загрузка бронирований для выбранного места (блок "Занятые слоты")
     * @param {string} workplaceId - ID рабочего места
     */
    async loadPlaceBookings(workplaceId) {
        const card = document.getElementById('place-bookings-card');
        const listContainer = document.getElementById('place-bookings-list');
        const placeNameSpan = document.getElementById('selected-place-name');

        if (!workplaceId) {
            card.style.display = 'none';
            return;
        }

        const selectedWorkplace = this.workplaces.find(wp => wp.id === workplaceId);
        if (selectedWorkplace) {
            placeNameSpan.textContent = `Занятые слоты: ${selectedWorkplace.name}`;
        }

        card.style.display = 'block';
        listContainer.innerHTML = '<div class="empty-message">Загрузка...</div>';

        try {
            console.log('Запрашиваю бронирования для места:', workplaceId);
            const bookings = await window.mockAPI.getBookingsByPlace(workplaceId);
            console.log('Получены бронирования:', bookings);

            if (!bookings || bookings.length === 0) {
                listContainer.innerHTML = '<div class="empty-message">На это место нет будущих бронирований</div>';
                return;
            }

            bookings.sort((a, b) => a.date.localeCompare(b.date));

            listContainer.innerHTML = bookings.map(booking => `
                <div class="booking-item" style="background: #fff3e0; border-left: 3px solid #ff9800;">
                    <div class="booking-header">
                        <span class="booking-resource">${booking.date}</span>
                        <span class="booking-status confirmed">Забронировано</span>
                    </div>
                    <div class="booking-details">
                        <div><i class="far fa-clock"></i> ${booking.startTime} - ${booking.endTime}</div>
                        ${booking.purpose ? `<div><i class="far fa-sticky-note"></i> ${booking.purpose}</div>` : ''}
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Ошибка загрузки бронирований места:', error);
            listContainer.innerHTML = '<div class="empty-message" style="color: #d32f2f;">Ошибка загрузки данных</div>';
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});