package com.booking.model;

/**
 * Модель рабочего места (компьютер, переговорная, конференц-зал)
 * Содержит координаты для отображения на карте и характеристики
 */

public class Workplace {
    private String id;
    private String name;
    private String type;
    private String branch;
    private int x;
    private int y;
    private Integer capacity;
    
    public Workplace() {}
    
    public Workplace(String id, String name, String type, String branch, int x, int y) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.branch = branch;
        this.x = x;
        this.y = y;
    }
    
    public Workplace(String id, String name, String type, String branch, int x, int y, int capacity) {
        this(id, name, type, branch, x, y);
        this.capacity = capacity;
    }
    
    // Геттеры и сеттеры
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    
    public int getX() { return x; }
    public void setX(int x) { this.x = x; }
    
    public int getY() { return y; }
    public void setY(int y) { this.y = y; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}