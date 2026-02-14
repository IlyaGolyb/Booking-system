package com.booking.controller;

import com.booking.model.Workplace;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * WorkplaceController - REST-контроллер для получения информации о рабочих местах
 * Предоставляет эндпоинты для получения списков компьютеров, переговорных и конференц-залов
 * Данные генерируются статически на основе конфигурации филиалов
 */
@RestController
@RequestMapping("/api/workplaces")
@CrossOrigin(origins = "http://localhost:5500")
public class WorkplaceController {

    /**
     * Получает список рабочих мест для указанного филиала
     * @param branch код филиала (moscow или spb)
     * @return список объектов Workplace с координатами и характеристиками
     */
    @GetMapping
    public List<Workplace> getWorkplaces(@RequestParam String branch) {
        if ("moscow".equals(branch)) {
            return getMoscowWorkplaces();
        } else if ("spb".equals(branch)) {
            return getSpbWorkplaces();
        }
        return new ArrayList<>();
    }
    
    /**
     * Генерирует список рабочих мест для московского филиала
     * @return список из 20 объектов (15 компьютеров, 3 переговорные, 2 конференц-зала)
     */
    private List<Workplace> getMoscowWorkplaces() {
        List<Workplace> workplaces = new ArrayList<>();
        
        // Московский филиал: рабочие места (15 шт)
        for (int i = 1; i <= 15; i++) {
            workplaces.add(new Workplace(
                "moscow-wp-" + i,                                   // ID
                "Компьютер " + i + " (PC-" + String.format("%02d", i) + ")", // Имя
                "workplace",                                        // Тип
                "moscow",                                           // Филиал
                150 + ((i-1) % 5) * 70,                             // X (5 колонок)
                100 + ((i-1) / 5) * 80                              // Y (3 ряда)
            ));
        }
        
        // Московский филиал: переговорные (3 шт)
        workplaces.add(new Workplace(
            "moscow-neg-1", "Переговорная А", "negotiation", "moscow", 
            600, 120, 4));  // capacity 4
        workplaces.add(new Workplace(
            "moscow-neg-2", "Переговорная Б", "negotiation", "moscow", 
            680, 120, 6));  // capacity 6
        workplaces.add(new Workplace(
            "moscow-neg-3", "Переговорная В", "negotiation", "moscow", 
            760, 120, 8));  // capacity 8
        
        // Московский филиал: конференц-залы (2 шт)
        workplaces.add(new Workplace(
            "moscow-conf-1", "Конференц-зал Большой", "conference", "moscow", 
            600, 250, 30)); // capacity 30
        workplaces.add(new Workplace(
            "moscow-conf-2", "Конференц-зал Малый", "conference", "moscow", 
            720, 250, 15)); // capacity 15
        
        System.out.println("Загружено ресурсов для МСК: " + workplaces.size() + " мест");
        return workplaces;
    }
    
    /**
     * Генерирует список рабочих мест для петербургского филиала
     * @return список из 18 объектов (15 компьютеров, 2 переговорные, 1 конференц-зал)
     */
    private List<Workplace> getSpbWorkplaces() {
        List<Workplace> workplaces = new ArrayList<>();
        
        // Петербургский филиал: рабочие места (15 шт)
        for (int i = 1; i <= 15; i++) {
            workplaces.add(new Workplace(
                "spb-wp-" + i,                                     // ID
                "Компьютер " + i + " (SPB-" + String.format("%02d", i) + ")", // Имя
                "workplace",                                        // Тип
                "spb",                                              // Филиал
                120 + ((i-1) % 5) * 70,                             // X (5 колонок)
                80 + ((i-1) / 5) * 80                               // Y (3 ряда)
            ));
        }
        
        // Петербургский филиал: переговорные (2 шт)
        workplaces.add(new Workplace(
            "spb-neg-1", "Переговорная Северная", "negotiation", "spb", 
            550, 100, 4));  // capacity 4
        workplaces.add(new Workplace(
            "spb-neg-2", "Переговорная Балтийская", "negotiation", "spb", 
            630, 100, 6));  // capacity 6
        
        // Петербургский филиал: конференц-зал (1 шт)
        workplaces.add(new Workplace(
            "spb-conf-1", "Конференц-зал Нева", "conference", "spb", 
            550, 220, 20)); // capacity 20
        
        System.out.println("Загружено ресурсов для СПб: " + workplaces.size() + " мест");
        return workplaces;
    }
}