package com.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import java.nio.charset.StandardCharsets;

/**
 * CharsetConfig - конфигурация кодировки символов для всего приложения
 * Устанавливает UTF-8 как основную кодировку для запросов и ответов
 */
@Configuration
public class CharsetConfig {

    /**
     * Регистрация фильтра для установки кодировки UTF-8
     * Применяется ко всем входящим запросам
     * @return зарегистрированный фильтр
     */
    @Bean
    public FilterRegistrationBean<CharacterEncodingFilter> utf8CharacterEncodingFilter() {
        FilterRegistrationBean<CharacterEncodingFilter> registrationBean = new FilterRegistrationBean<>();
        
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        filter.setForceEncoding(true);  // Принудительная установка кодировки
        
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/*");  // Применяется ко всем URL
        
        return registrationBean;
    }

    /**
     * Конвертер для HTTP сообщений в кодировке UTF-8
     * @return конвертер строк
     */
    @Bean
    public StringHttpMessageConverter stringHttpMessageConverter() {
        return new StringHttpMessageConverter(StandardCharsets.UTF_8);
    }
}