package com.booking.controller;

import com.booking.model.Booking;
import com.booking.service.HdfsStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * BookingController - REST-контроллер для управления бронированиями
 * Предоставляет эндпоинты для создания, получения, отмены бронирований
 * и проверки доступности мест
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5500")
public class BookingController {

    @Autowired
    private HdfsStorageService hdfsService;
    
    private static final String BOOKINGS_DIR = "/user/booking/bookings/";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    /**
     * Создание нового бронирования
     * @param booking данные бронирования из тела запроса
     * @return карта с результатом операции (success, id, message)
     */
    @PostMapping
    public Map<String, Object> createBooking(@RequestBody Booking booking) {
        try {
            System.out.println("Получено бронирование:");
            System.out.println("  UserID: " + booking.getUserId());
            System.out.println("  Место: " + booking.getWorkplaceId());
            System.out.println("  Дата: " + booking.getDate());
            
            String bookingId = UUID.randomUUID().toString();
            booking.setId(bookingId);
            booking.setStatus("confirmed");
            
            LocalDate date = LocalDate.parse(booking.getDate(), DATE_FORMAT);
            String datePath = String.format("/%d/%02d/%02d", 
                date.getYear(), date.getMonthValue(), date.getDayOfMonth());
            
            String filePath = BOOKINGS_DIR + datePath + "/booking_" + bookingId + ".json";
            
            hdfsService.saveJson(filePath, booking);
            
            return Map.of(
                "success", true,
                "id", bookingId,
                "message", "Бронирование успешно создано"
            );
            
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    /**
     * Получение бронирований конкретного пользователя
     * @param userId идентификатор пользователя
     * @return список бронирований пользователя
     */
    @GetMapping
    public List<Booking> getMyBookings(@RequestParam String userId) {
        List<Booking> userBookings = new ArrayList<>();
        
        try {
            System.out.println("Запрос бронирований для userId: " + userId);
            System.out.println("BOOKINGS_DIR = " + BOOKINGS_DIR);
            
            boolean exists = hdfsService.exists(BOOKINGS_DIR);
            System.out.println("Папка существует: " + exists);
            
            if (!exists) {
                System.out.println("Папка не найдена");
                return userBookings;
            }
            
            List<String> files = hdfsService.listFiles(BOOKINGS_DIR);
            System.out.println("Всего файлов в HDFS: " + files.size());
            
            if (files.isEmpty()) {
                System.out.println("Файлы не найдены");
            } else {
                System.out.println("Первые 5 файлов:");
                files.stream().limit(5).forEach(f -> System.out.println("  " + f));
            }
            
            for (String filePath : files) {
                if (filePath.endsWith(".json")) {
                    try {
                        Booking booking = hdfsService.readJson(filePath, Booking.class);
                        if (booking != null) {
                            System.out.println("Файл: " + filePath);
                            System.out.println("  userId в файле: " + booking.getUserId());
                            
                            if (userId.equals(booking.getUserId())) {
                                userBookings.add(booking);
                                System.out.println("  Бронирование добавлено в список");
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Ошибка чтения файла: " + filePath);
                    }
                }
            }
            
            System.out.println("Найдено бронирований: " + userBookings.size());
            
        } catch (Exception e) {
            System.err.println("Ошибка при получении бронирований:");
            e.printStackTrace();
        }
        
        return userBookings;
    }

    /**
     * Отмена бронирования по ID
     * @param id идентификатор бронирования
     * @return карта с результатом операции
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> cancelBooking(@PathVariable String id) {
        try {
            System.out.println("Поиск бронирования для отмены, id: " + id);
            
            List<String> files = hdfsService.listFiles(BOOKINGS_DIR);
            System.out.println("Всего файлов в HDFS: " + files.size());
            
            String foundPath = null;
            
            for (String filePath : files) {
                if (filePath.contains(id) && filePath.endsWith(".json")) {
                    foundPath = filePath;
                    System.out.println("Файл найден: " + filePath);
                    break;
                }
            }
            
            if (foundPath != null) {
                System.out.println("Удаление файла: " + foundPath);
                boolean deleted = hdfsService.delete(foundPath);
                
                if (deleted) {
                    System.out.println("Бронирование успешно отменено");
                } else {
                    System.out.println("Ошибка при удалении файла");
                }
                
                return Map.of(
                    "success", deleted,
                    "message", deleted ? "Бронирование отменено" : "Ошибка при удалении"
                );
            } else {
                System.out.println("Файл с ID " + id + " не найден");
                return Map.of(
                    "success", false,
                    "error", "Бронирование не найдено"
                );
            }
            
        } catch (Exception e) {
            System.err.println("Ошибка при отмене бронирования:");
            e.printStackTrace();
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }

    /**
     * Проверка доступности места на указанное время
     * @param workplaceId ID рабочего места
     * @param date дата в формате ДД.ММ.ГГГГ
     * @param startTime время начала
     * @param endTime время окончания
     * @return карта с полем available (true/false)
     */
    @GetMapping("/check-availability")
    public Map<String, Object> checkAvailability(
            @RequestParam String workplaceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        
        try {
            System.out.println("Проверка доступности:");
            System.out.println("  Место: " + workplaceId);
            System.out.println("  Дата: " + date);
            System.out.println("  Время: " + startTime + " - " + endTime);
            
            LocalDate bookingDate = LocalDate.parse(date, DATE_FORMAT);
            String datePath = String.format("/%d/%02d/%02d", 
                bookingDate.getYear(), bookingDate.getMonthValue(), bookingDate.getDayOfMonth());
            
            String fullPath = BOOKINGS_DIR + datePath;
            System.out.println("  Путь: " + fullPath);
            
            List<String> files = hdfsService.listFiles(fullPath);
            System.out.println("  Файлов на дату: " + files.size());
            
            boolean isAvailable = true;
            
            for (String filePath : files) {
                if (filePath.endsWith(".json")) {
                    Booking booking = hdfsService.readJson(filePath, Booking.class);
                    if (booking != null && workplaceId.equals(booking.getWorkplaceId())) {
                        System.out.println("  Найдено бронирование: " + booking.getId());
                        System.out.println("    Время: " + booking.getStartTime() + " - " + booking.getEndTime());
                        
                        if (hasTimeOverlap(startTime, endTime, booking.getStartTime(), booking.getEndTime())) {
                            System.out.println("  Время пересекается");
                            isAvailable = false;
                            break;
                        }
                    }
                }
            }
            
            System.out.println("  Доступно: " + isAvailable);
            
            return Map.of(
                "available", isAvailable,
                "workplaceId", workplaceId,
                "date", date
            );
            
        } catch (Exception e) {
            System.err.println("Ошибка проверки доступности:");
            e.printStackTrace();
            return Map.of(
                "available", false,
                "error", e.getMessage()
            );
        }
    }

    /**
     * Получение всех бронирований для конкретного места (блок "Занятые слоты")
     * @param workplaceId ID рабочего места
     * @return список всех бронирований для этого места
     */
    @GetMapping("/by-place")
    public List<Booking> getBookingsByPlace(@RequestParam String workplaceId) {
        List<Booking> placeBookings = new ArrayList<>();
        
        try {
            System.out.println("Запрос бронирований для места: " + workplaceId);
            
            List<String> files = hdfsService.listFiles(BOOKINGS_DIR);
            System.out.println("Всего файлов в HDFS: " + files.size());
            
            for (String filePath : files) {
                if (filePath.endsWith(".json")) {
                    try {
                        Booking booking = hdfsService.readJson(filePath, Booking.class);
                        
                        if (booking != null) {
                            System.out.println("Проверка файла: " + filePath);
                            System.out.println("  workplaceId в файле: " + booking.getWorkplaceId());
                            
                            if (workplaceId.equals(booking.getWorkplaceId())) {
                                System.out.println("  Найдено совпадение");
                                placeBookings.add(booking);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Ошибка чтения файла: " + filePath);
                    }
                }
            }
            
            System.out.println("Найдено бронирований: " + placeBookings.size());
            
        } catch (Exception e) {
            System.err.println("Ошибка при получении бронирований для места:");
            e.printStackTrace();
        }
        
        return placeBookings;
    }

    /**
     * Проверка пересечения временных интервалов
     * @param start1 начало первого интервала
     * @param end1 конец первого интервала
     * @param start2 начало второго интервала
     * @param end2 конец второго интервала
     * @return true если интервалы пересекаются
     */
    private boolean hasTimeOverlap(String start1, String end1, String start2, String end2) {
        return start1.compareTo(end2) < 0 && start2.compareTo(end1) < 0;
    }
}