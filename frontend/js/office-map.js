/**
 * Класс для управления интерактивной картой офиса
 * Отвечает за отображение схемы, масштабирование, перетаскивание и переключение филиалов
 */
class OfficeMap {
    /**
     * @param {string} containerId - ID DOM-элемента, куда будет встроена карта
     */
    constructor(containerId) {
        // Получаем DOM-элемент контейнера
        this.container = document.getElementById(containerId);
        
        // Данные о рабочих местах текущего филиала
        this.workplaces = [];
        
        // Параметры трансформации карты
        this.scale = 1;           // Текущий масштаб (1 = 100%)
        this.offsetX = 0;          // Смещение по X при перетаскивании
        this.offsetY = 0;          // Смещение по Y при перетаскивании
        
        // Состояние перетаскивания
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.startOffsetX = 0;
        this.startOffsetY = 0;
        
        // Текущий выбранный филиал
        this.currentBranch = 'moscow';
        this.showGrid = false;      // Показывать ли сетку
        
        /**
         * Конфигурация филиалов
         * Содержит название, путь к изображению и список рабочих мест
         */
        this.branchConfig = {
            moscow: {
                name: 'Москва',
                imageUrl: 'images/moscow-office.png',    // Путь к схеме офиса
                workplaces: this.getMoscowWorkplaces()    // Данные о местах
            },
            spb: {
                name: 'Санкт-Петербург',
                imageUrl: 'images/spb-office.png',
                workplaces: this.getSpbWorkplaces()
            }
        };
        
        // Запуск инициализации
        this.init();
    }
    
    /**
     * Инициализация карты
     */
    init() {
        this.loadWorkplaces();      // Загружаем данные о местах
        this.render();              // Отрисовываем карту
        this.setupEventListeners(); // Настраиваем обработчики событий
    }
    
    /**
     * Возвращает список рабочих мест для Москвы
     * @returns {Array} Массив объектов с координатами и параметрами мест
     */
    getMoscowWorkplaces() {
        return [
            // Генерация 15 рабочих мест (компьютеров) с координатами
            ...Array.from({ length: 15 }, (_, i) => ({
                id: `moscow-wp-${i + 1}`,                    // Уникальный ID
                name: `Компьютер ${i + 1} (PC-${String(i + 1).padStart(2, '0')})`,
                number: `${i + 1}`,
                type: 'workplace',
                branch: 'moscow',
                x: 150 + (i % 5) * 70,                       // Координата X (5 колонок)
                y: 100 + Math.floor(i / 5) * 80              // Координата Y (3 ряда)
            })),
            // Переговорные комнаты (3 шт)
            {
                id: 'moscow-neg-1',
                name: 'Переговорная А',
                number: 'П1',
                type: 'negotiation',
                branch: 'moscow',
                x: 600, y: 120,
                capacity: 4
            },
            {
                id: 'moscow-neg-2',
                name: 'Переговорная Б',
                number: 'П2',
                type: 'negotiation',
                branch: 'moscow',
                x: 680, y: 120,
                capacity: 6
            },
            {
                id: 'moscow-neg-3',
                name: 'Переговорная В',
                number: 'П3',
                type: 'negotiation',
                branch: 'moscow',
                x: 760, y: 120,
                capacity: 8
            },
            // Конференц-залы (2 шт)
            {
                id: 'moscow-conf-1',
                name: 'Конференц-зал Большой',
                number: 'К1',
                type: 'conference',
                branch: 'moscow',
                x: 600, y: 250,
                capacity: 30
            },
            {
                id: 'moscow-conf-2',
                name: 'Конференц-зал Малый',
                number: 'К2',
                type: 'conference',
                branch: 'moscow',
                x: 720, y: 250,
                capacity: 15
            }
        ];
    }

    /**
     * Возвращает список рабочих мест для Санкт-Петербурга
     * @returns {Array} Массив объектов с координатами и параметрами мест
     */
    getSpbWorkplaces() {
        return [
            // Генерация 15 рабочих мест (компьютеров) с координатами
            ...Array.from({ length: 15 }, (_, i) => ({
                id: `spb-wp-${i + 1}`,
                name: `Компьютер ${i + 1} (SPB-${String(i + 1).padStart(2, '0')})`,
                number: `${i + 1}`,
                type: 'workplace',
                branch: 'spb',
                x: 120 + (i % 5) * 70,
                y: 80 + Math.floor(i / 5) * 80
            })),
            // Переговорные комнаты (2 шт)
            {
                id: 'spb-neg-1',
                name: 'Переговорная Северная',
                number: 'П1',
                type: 'negotiation',
                branch: 'spb',
                x: 550, y: 100,
                capacity: 4
            },
            {
                id: 'spb-neg-2',
                name: 'Переговорная Балтийская',
                number: 'П2',
                type: 'negotiation',
                branch: 'spb',
                x: 630, y: 100,
                capacity: 6
            },
            // Конференц-зал (1 шт)
            {
                id: 'spb-conf-1',
                name: 'Конференц-зал Нева',
                number: 'К1',
                type: 'conference',
                branch: 'spb',
                x: 550, y: 220,
                capacity: 20
            }
        ];
    }
    
    /**
     * Загружает рабочие места текущего филиала и проверяет их занятость
     */
    loadWorkplaces() {
        const config = this.branchConfig[this.currentBranch];
        this.workplaces = config.workplaces.map(wp => ({
            ...wp,
            isBooked: this.isWorkplaceBooked(wp.id)    // Проверка, занято ли сейчас
        }));
    }
    
    /**
     * Проверяет, занято ли рабочее место в данный момент
     * @param {string} workplaceId - ID рабочего места
     * @returns {boolean} true - занято, false - свободно
     */
    isWorkplaceBooked(workplaceId) {
        if (!window.mockAPI) return false;
        try {
            const today = new Date().toISOString().split('T')[0];
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            if (!window.mockAPI.bookings) return false;
            
            return window.mockAPI.bookings.some(b => 
                b.workplaceId === workplaceId && 
                b.date === today && 
                b.status === 'confirmed' &&
                this.isCurrentTimeInSlot(b.startTime, b.endTime, currentTime)
            );
        } catch (e) {
            console.warn('Ошибка проверки бронирования:', e);
            return false;
        }
    }
    
    /**
     * Проверяет, попадает ли текущее время в указанный интервал
     * @param {string} start - время начала (ЧЧ:ММ)
     * @param {string} end - время окончания (ЧЧ:ММ)
     * @param {string} current - текущее время (ЧЧ:ММ)
     * @returns {boolean}
     */
    isCurrentTimeInSlot(start, end, current) {
        const toMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const startMinutes = toMinutes(start);
        const endMinutes = toMinutes(end);
        const currentMinutes = toMinutes(current);
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
    
    /**
     * Отрисовывает карту офиса
     * Создаёт DOM-элементы для изображения и накладывает сетку
     */
    render() {
        this.container.innerHTML = '';
        const config = this.branchConfig[this.currentBranch];
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'map-image-container';
        
        const img = document.createElement('img');
        img.className = 'map-image';
        img.src = config.imageUrl;
        img.alt = `План офиса ${config.name}`;
        img.style.transform = `scale(${this.scale}) translate(${this.offsetX}px, ${this.offsetY}px)`;
        img.style.transformOrigin = '0 0';
        
        // Обработчик успешной загрузки изображения
        img.onload = () => {
            const placeholder = this.container.querySelector('.map-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        };
        
        // Обработчик ошибки загрузки изображения
        img.onerror = () => {
            const placeholder = this.container.querySelector('.map-placeholder');
            if (placeholder) {
                placeholder.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Не удалось загрузить план офиса</p>
                    <p style="font-size: 12px;">Пожалуйста, добавьте изображение в папку images/</p>
                `;
            }
        };
        
        imageContainer.appendChild(img);
        
        // Оверлей для возможных маркеров (не используется, но оставлен для совместимости)
        const overlay = document.createElement('div');
        overlay.className = 'map-overlay';
        imageContainer.appendChild(overlay);
        
        // Оверлей для сетки
        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'map-grid-overlay';
        if (this.showGrid) gridOverlay.classList.add('visible');
        imageContainer.appendChild(gridOverlay);
        
        this.container.appendChild(imageContainer);
        
        const placeholder = this.container.querySelector('.map-placeholder');
        if (placeholder) placeholder.style.display = 'flex';
    }
    
    /**
     * Переключает текущий филиал
     * @param {string} branchId - 'moscow' или 'spb'
     */
    changeBranch(branchId) {
        if (this.branchConfig[branchId]) {
            this.currentBranch = branchId;
            this.scale = 1;           // Сброс масштаба
            this.offsetX = 0;          // Сброс смещения
            this.offsetY = 0;
            this.loadWorkplaces();      // Загрузка мест нового филиала
            this.render();              // Перерисовка карты
        }
    }
    
    /**
     * Настройка обработчиков событий для интерактивности
     */
    setupEventListeners() {
        // Кнопка увеличения масштаба
        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.scale = Math.min(this.scale + 0.1, 3);
            this.updateImageTransform();
        });
        
        // Кнопка уменьшения масштаба
        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.scale = Math.max(this.scale - 0.1, 0.5);
            this.updateImageTransform();
        });
        
        // Кнопка сброса вида
        document.getElementById('reset-view')?.addEventListener('click', () => {
            this.scale = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            this.updateImageTransform();
        });
        
        // Кнопка включения/выключения сетки
        document.getElementById('toggle-grid')?.addEventListener('click', () => {
            this.showGrid = !this.showGrid;
            const gridOverlay = this.container.querySelector('.map-grid-overlay');
            if (gridOverlay) {
                if (this.showGrid) {
                    gridOverlay.classList.add('visible');
                } else {
                    gridOverlay.classList.remove('visible');
                }
            }
        });
        
        // Начало перетаскивания карты
        this.container.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('map-image') || 
                e.target.classList.contains('map-image-container') ||
                e.target.classList.contains('map-overlay') ||
                e.target.classList.contains('map-grid-overlay')) {
                this.startDragging(e.clientX, e.clientY);
            }
        });
        
        // Перемещение при перетаскивании
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e.clientX, e.clientY);
            }
        });
        
        // Окончание перетаскивания
        document.addEventListener('mouseup', () => {
            this.stopDragging();
        });
        
        // Масштабирование колёсиком мыши
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
            this.updateImageTransform();
        });
    }
    
    /**
     * Применяет текущие трансформации к изображению
     */
    updateImageTransform() {
        const img = this.container.querySelector('.map-image');
        if (img) {
            img.style.transform = `scale(${this.scale}) translate(${this.offsetX}px, ${this.offsetY}px)`;
        }
    }
    
    /**
     * Начинает перетаскивание карты
     * @param {number} clientX - координата X мыши
     * @param {number} clientY - координата Y мыши
     */
    startDragging(clientX, clientY) {
        this.isDragging = true;
        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.startOffsetX = this.offsetX;
        this.startOffsetY = this.offsetY;
        this.container.style.cursor = 'grabbing';
    }
    
    /**
     * Обрабатывает перетаскивание
     * @param {number} clientX - текущая координата X мыши
     * @param {number} clientY - текущая координата Y мыши
     */
    drag(clientX, clientY) {
        if (!this.isDragging) return;
        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;
        this.offsetX = this.startOffsetX + deltaX / this.scale;
        this.offsetY = this.startOffsetY + deltaY / this.scale;
        this.updateImageTransform();
    }
    
    /**
     * Завершает перетаскивание
     */
    stopDragging() {
        this.isDragging = false;
        this.container.style.cursor = 'default';
    }
    
    /**
     * Метод-заглушка для подсветки выбранного места
     * @param {string} workplaceId - ID выбранного места
     */
    highlightWorkplace(workplaceId) {
        console.log('Выбрано место:', workplaceId);
        this.selectedWorkplaceId = workplaceId;
    }
}

// Инициализация карты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.officeMap = new OfficeMap('office-map');
});