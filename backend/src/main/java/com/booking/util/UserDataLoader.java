package com.booking.util;

import com.booking.model.User;
import com.booking.service.UserService;
import com.booking.service.HdfsStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.apache.hadoop.fs.Path;

/**
 * UserDataLoader - загрузчик тестовых пользователей при первом запуске
 * Реализует CommandLineRunner, выполняется после старта приложения
 * Создаёт папку /user/booking/users/ в HDFS и добавляет трёх тестовых пользователей
 */
@Component
public class UserDataLoader implements CommandLineRunner {

    @Autowired
    private UserService userService;
    
    @Autowired
    private HdfsStorageService hdfsStorageService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Загрузка пользователей...");
        
        // Создание папки для пользователей в HDFS
        String usersDir = "/user/booking/users/";
        createUsersDirectoryIfNotExists(usersDir);

        // Создание тестовых пользователей
        createTestUsers();
        
        System.out.println("Загрузка пользователей завершена");
    }
    
    /**
     * Создаёт папку для пользователей в HDFS, если она не существует
     * @param usersDir путь к папке в HDFS
     */
    private void createUsersDirectoryIfNotExists(String usersDir) throws Exception {
        if (!hdfsStorageService.exists(usersDir)) {
            Path path = new Path(usersDir);
            org.apache.hadoop.fs.FileSystem fs = org.apache.hadoop.fs.FileSystem.get(
                new org.apache.hadoop.conf.Configuration()
            );
            fs.mkdirs(path);
            System.out.println("Создана папка для пользователей: " + usersDir);
        }
    }
    
    /**
     * Создаёт трёх тестовых пользователей, если они ещё не существуют
     */
    private void createTestUsers() throws Exception {
        createUserIfNotExists("admin", "admin123", 
            "Администратор Системы", "admin", "admin@company.com");
        createUserIfNotExists("user", "user123", 
            "Иван Петров", "user", "user@company.com");
        createUserIfNotExists("employee1", "123456", 
            "Мария Сидорова", "user", "employee1@company.com");
    }
    
    /**
     * Создаёт одного пользователя, если его нет в системе
     */
    private void createUserIfNotExists(String username, String password, 
                                       String name, String role, String email) throws Exception {
        if (userService.findByUsername(username) == null) {
            userService.createUser(
                new User(username, "", name, role, email, 
                        new java.util.Date().toString()),
                password
            );
            System.out.println("Создан пользователь " + username);
        }
    }
}