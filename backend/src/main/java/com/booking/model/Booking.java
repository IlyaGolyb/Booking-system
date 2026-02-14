package com.booking.model;

/**
 * Booking - модель данных для бронирования
 * Содержит всю информацию о бронировании рабочего места:
 * - идентификаторы пользователя и места
 * - дату и время бронирования
 * - статус и цель
 */
public class Booking {
    private String id;              // Уникальный идентификатор бронирования
    private String userId;           // ID пользователя (admin, user, employee1)
    private String workplaceId;      // ID рабочего места
    private String workplaceName;    // Название рабочего места
    private String branch;            // Филиал (moscow/spb)
    private String date;              // Дата в формате ДД.ММ.ГГГГ
    private String startTime;         // Время начала (ЧЧ:ММ)
    private String endTime;           // Время окончания (ЧЧ:ММ)
    private String purpose;           // Цель бронирования
    private String status;            // Статус (confirmed/cancelled)
    
    /**
     * Конструктор по умолчанию для Jackson
     */
    public Booking() {}
    
    /**
     * Полный конструктор для создания объекта бронирования
     */
    public Booking(String id, String userId, String workplaceId, String workplaceName, 
                   String branch, String date, String startTime, String endTime, 
                   String purpose, String status) {
        this.id = id;
        this.userId = userId;
        this.workplaceId = workplaceId;
        this.workplaceName = workplaceName;
        this.branch = branch;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.status = status;
    }
    
    // Геттеры и сеттеры
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getWorkplaceId() { return workplaceId; }
    public void setWorkplaceId(String workplaceId) { this.workplaceId = workplaceId; }
    
    public String getWorkplaceName() { return workplaceName; }
    public void setWorkplaceName(String workplaceName) { this.workplaceName = workplaceName; }
    
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}