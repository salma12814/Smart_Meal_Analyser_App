package com.smeal.service;

import static org.junit.jupiter.api.Assertions.*;
import java.util.Map;
import org.junit.jupiter.api.Test;

class HealthScoreServiceTest {
    private final HealthScoreService service = new HealthScoreService();

    @Test void awardsProteinFiberAndModerateCalories() {
        var result = service.calculate(Map.of("proteins", 20d, "fiber", 5d, "calories", 150d));
        assertEquals(95, result.score());
        assertEquals("A", result.grade());
        assertEquals(20, result.breakdown().get("protein"));
    }

    @Test void clampsPenaltiesAtZero() {
        var result = service.calculate(Map.of("calories", 401d, "fats", 20.1d, "sugarTotal", 15.1d, "sodium", 601d));
        assertEquals(0, result.score());
        assertEquals("E", result.grade());
    }
}
