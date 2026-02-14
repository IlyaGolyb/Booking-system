package com.booking.service;

import com.booking.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Сервис для работы с пользователями
 * Хранит данные в HDFS в виде JSON-файлов
 * Пароли хешируются с помощью BCrypt
 */

@Service
public class UserService {

    @Autowired
    private HdfsStorageService hdfsService;
    
    private static final String USERS_DIR = "/user/booking/users/";
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Найти пользователя по имени
     */
    public User findByUsername(String username) throws IOException {
        String path = USERS_DIR + username + ".json";
        return hdfsService.readJson(path, User.class);
    }
    
    /**
     * Проверить пароль
     */
    public boolean authenticate(String username, String password) throws IOException {
        User user = findByUsername(username);
        if (user == null) return false;
        
        // Сравниваем введённый пароль с хешем из файла
        return passwordEncoder.matches(password, user.getPasswordHash());
    }
    
    /**
     * Создать нового пользователя (только для админа)
     */
    public boolean createUser(User user, String rawPassword) throws IOException {
        // Проверяем, существует ли уже
        if (findByUsername(user.getUsername()) != null) {
            return false;
        }
        
        // Хешируем пароль
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        
        // Сохраняем в HDFS
        String path = USERS_DIR + user.getUsername() + ".json";
        hdfsService.saveJson(path, user);
        return true;
    }
    
    /**
     * Получить всех пользователей (для админа)
     */
    public List<User> getAllUsers() throws IOException {
        List<String> files = hdfsService.listFiles(USERS_DIR);
        List<User> users = new ArrayList<>();
        
        for (String filePath : files) {
            if (filePath.endsWith(".json")) {
                User user = hdfsService.readJson(filePath, User.class);
                if (user != null) {
                    users.add(user);
                }
            }
        }
        return users;
    }
}