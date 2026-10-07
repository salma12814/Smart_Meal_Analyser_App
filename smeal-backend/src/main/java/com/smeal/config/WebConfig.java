package com.smeal.config;

import java.util.Arrays;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private static final String VITE_DEFAULT_ORIGIN = "http://localhost:5173";
    private static final String VITE_ALTERNATE_ORIGIN = "http://localhost:5174";

    @Value("${FRONTEND_ORIGIN:http://localhost:5173}")
    private String configuredFrontendOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] allowedOrigins = Stream.concat(
                        Stream.of(VITE_DEFAULT_ORIGIN, VITE_ALTERNATE_ORIGIN),
                        Arrays.stream(configuredFrontendOrigins.split(",")))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .distinct()
                .toArray(String[]::new);

        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*", "Authorization", "Content-Type");
    }
}
