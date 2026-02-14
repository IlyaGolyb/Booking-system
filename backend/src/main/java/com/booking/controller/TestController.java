package com.booking.controller;

import org.springframework.web.bind.annotation.*;

/**
 * TestController - контроллер для проверки работоспособности бэкенда
 * Содержит простые эндпоинты для тестирования доступности сервера
 */
@RestController
@CrossOrigin(origins = "http://localhost:5500")
public class TestController {
    
    /**
     * Корневой эндпоинт для проверки, что бэкенд запущен
     * @return приветственное сообщение
     */
    @GetMapping("/")
    public String hello() {
        return "Бэкенд работает!";
    }
    
    /**
     * Эндпоинт для проверки здоровья приложения
     * Используется фронтендом для проверки доступности сервера
     * @return строка "OK" если сервер работает
     */
    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }
}