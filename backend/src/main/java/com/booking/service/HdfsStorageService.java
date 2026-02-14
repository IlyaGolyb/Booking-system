package com.booking.service;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;
import java.util.HashSet;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * HdfsStorageService - сервис для работы с HDFS (Hadoop Distributed File System)
 * Обеспечивает чтение, запись, удаление и поиск файлов в HDFS
 * Все данные хранятся в формате JSON с кодировкой UTF-8
 */
@Service
public class HdfsStorageService {

    private FileSystem fs;
    private final ObjectMapper objectMapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature());
    
    // Адрес HDFS и пользователь (настраивается под конкретное окружение)
    private String hdfsUri = "hdfs://192.168.0.109:9000";
    private String hdfsUser = "ilgol";
    
    /**
     * Инициализация подключения к HDFS
     * Выполняется автоматически после создания бина
     */
    @PostConstruct
    public void init() {
        try {
            System.out.println("Подключение к HDFS: " + hdfsUri);
            System.out.println("Пользователь HDFS: " + hdfsUser);
            
            // Обязательно для Windows - указываем путь к установленному Hadoop
            System.setProperty("hadoop.home.dir", "C:\\hadoop");
            
            Configuration conf = new Configuration();
            conf.set("fs.defaultFS", hdfsUri);
            conf.set("fs.hdfs.impl", "org.apache.hadoop.hdfs.DistributedFileSystem");
            conf.set("dfs.client.use.datanode.hostname", "true");
            conf.set("dfs.client.block.write.replace-datanode-on-failure.policy", "NEVER");
            
            // Явное указание пользователя для доступа к HDFS
            System.setProperty("HADOOP_USER_NAME", hdfsUser);
            
            // Создание файловой системы с правильным URI
            this.fs = FileSystem.get(new java.net.URI(hdfsUri), conf, hdfsUser);
            
            // Тестовая запись для проверки работоспособности
            Path testPath = new Path("/user/booking/test_connection");
            fs.mkdirs(testPath);
            fs.delete(testPath, true);
            
            System.out.println("HDFS подключен и работает: " + hdfsUri);
            System.out.println("Тестовая запись успешна");
            
        } catch (Exception e) {
            System.err.println("Ошибка подключения к HDFS: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Сохраняет объект в HDFS в виде JSON-файла
     * @param path путь в HDFS (например, /user/booking/bookings/file.json)
     * @param data объект для сохранения
     * @throws IOException при ошибках ввода-вывода
     */
    public void saveJson(String path, Object data) throws IOException {
        Path hdfsPath = new Path(path);
        
        // Явное указание UTF-8 при сериализации
        String json = objectMapper.writeValueAsString(data);
        
        // Создание директорий, если их нет
        fs.mkdirs(hdfsPath.getParent());
        
        try (FSDataOutputStream out = fs.create(hdfsPath, true)) {
            // Запись в UTF-8
            out.write(json.getBytes(StandardCharsets.UTF_8));
            out.hsync();
            System.out.println("Сохранен файл: " + path);
            System.out.println("Размер: " + json.getBytes(StandardCharsets.UTF_8).length + " байт");
        }
    }

    /**
     * Читает JSON-файл из HDFS и преобразует его в объект указанного класса
     * @param path путь к файлу в HDFS
     * @param valueType класс, в который нужно преобразовать JSON
     * @return объект типа T или null, если файл не существует
     * @throws IOException при ошибках ввода-вывода
     */
    public <T> T readJson(String path, Class<T> valueType) throws IOException {
        Path hdfsPath = new Path(path);
        
        if (!fs.exists(hdfsPath)) {
            return null;
        }
        
        try (FSDataInputStream in = fs.open(hdfsPath)) {
            // Чтение файла полностью
            byte[] bytes = new byte[(int) fs.getFileStatus(hdfsPath).getLen()];
            in.readFully(bytes);
            
            // Декодирование в UTF-8
            String json = new String(bytes, StandardCharsets.UTF_8);
            System.out.println("Прочитан файл: " + path);
            System.out.println("Содержимое: " + json.substring(0, Math.min(100, json.length())) + "...");
            
            return objectMapper.readValue(json, valueType);
        }
    }
    
    /**
     * Удаляет файл из HDFS
     * @param path путь к файлу в HDFS
     * @return true если удаление успешно, false в противном случае
     * @throws IOException при ошибках ввода-вывода
     */
    public boolean delete(String path) throws IOException {
        System.out.println("Удаление файла: " + path);
        
        Path hdfsPath = new Path(path);
        
        // Проверка существования файла
        boolean exists = fs.exists(hdfsPath);
        
        if (!exists) {
            System.out.println("Файл не найден");
            return false;
        }
        
        // Проверка, файл это или папка
        boolean isFile = fs.getFileStatus(hdfsPath).isFile();
        System.out.println("Это файл: " + isFile);
        
        // Попытка удаления
        boolean deleted = fs.delete(hdfsPath, false);
        
        if (deleted) {
            System.out.println("Файл успешно удален из HDFS");
        } else {
            System.out.println("Ошибка при удалении файла");
            
            // Проверка прав доступа
            FileStatus status = fs.getFileStatus(hdfsPath);
            System.out.println("Владелец: " + status.getOwner());
            System.out.println("Права: " + status.getPermission());
        }
        
        return deleted;
    }
    
    /**
     * Проверяет существование файла или папки в HDFS
     * @param path путь для проверки
     * @return true если объект существует
     * @throws IOException при ошибках ввода-вывода
     */
    public boolean exists(String path) throws IOException {
        return fs.exists(new Path(path));
    }
    
    /**
     * Возвращает список всех файлов в указанной директории (рекурсивно)
     * @param directory путь к директории в HDFS
     * @return список уникальных путей к файлам
     * @throws IOException при ошибках ввода-вывода
     */
    public List<String> listFiles(String directory) throws IOException {
        Path dirPath = new Path(directory);
        Set<String> uniqueFiles = new HashSet<>();
        
        System.out.println("Поиск файлов в: " + directory);
        
        if (!fs.exists(dirPath)) {
            System.out.println("Папка не существует");
            return new ArrayList<>();
        }
        
        // Рекурсивный обход всех файлов
        RemoteIterator<LocatedFileStatus> iterator = fs.listFiles(dirPath, true);
        while (iterator.hasNext()) {
            LocatedFileStatus status = iterator.next();
            if (status.isFile()) {
                uniqueFiles.add(status.getPath().toString());
            }
        }
        
        System.out.println("Найдено уникальных файлов: " + uniqueFiles.size());
        return new ArrayList<>(uniqueFiles);
    }
}