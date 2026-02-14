package com.booking.model;

public class User {
    private String username;
    private String passwordHash; // BCrypt hash!
    private String name;
    private String role;
    private String email;
    private String createdAt;
    
    public User() {}
    
    public User(String username, String passwordHash, String name, String role, String email, String createdAt) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.name = name;
        this.role = role;
        this.email = email;
        this.createdAt = createdAt;
    }
    
    // Геттеры и сеттеры
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}