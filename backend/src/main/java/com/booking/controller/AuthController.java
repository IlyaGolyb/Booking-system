package com.booking.controller;

import com.booking.model.User;
import com.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * AuthController - контроллер для аутентификации пользователей
 * Предоставляет эндпоинт для входа в систему
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5500")
public class AuthController {

    @Autowired
    private UserService userService;
    
    /**
     * Аутентификация пользователя
     * @param credentials карта с полями username и password
     * @return результат аутентификации с данными пользователя или сообщением об ошибке
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        System.out.println("Попытка входа: " + username);
        
        try {
            boolean authenticated = userService.authenticate(username, password);
            
            if (authenticated) {
                User user = userService.findByUsername(username);
                System.out.println("Успешный вход: " + username);
                
                return Map.of(
                    "success", true,
                    "username", username,
                    "name", user.getName(),
                    "role", user.getRole(),
                    "email", user.getEmail(),
                    "message", "Вход выполнен успешно"
                );
            } else {
                System.out.println("Неудачная попытка входа: " + username);
                return Map.of(
                    "success", false,
                    "error", "Неверный логин или пароль"
                );
            }
        } catch (Exception e) {
            System.err.println("Ошибка при входе пользователя " + username + ": " + e.getMessage());
            e.printStackTrace();
            return Map.of(
                "success", false,
                "error", "Ошибка сервера: " + e.getMessage()
            );
        }
    }
}