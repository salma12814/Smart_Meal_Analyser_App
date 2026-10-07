package com.smeal.controller;

import com.smeal.entity.Meal;
import com.smeal.service.MealService;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/meals/history")
public class HistoryController {
    private final MealService service;
    public HistoryController(MealService service) { this.service = service; }
    @GetMapping
    public Map<String, Object> history(@RequestParam(defaultValue = "0") int offset,
                                        @RequestParam(defaultValue = "20") int limit,
                                        Authentication auth) {
        int safeOffset = Math.max(0, offset), safeLimit = Math.min(100, Math.max(1, limit));
        Page<Meal> page = service.history(UUID.fromString(auth.getName()), safeOffset, safeLimit);
        List<Map<String, Object>> rows = page.getContent().stream().map(meal -> Map.<String, Object>of(
                "mealId", meal.getId(), "timestamp", meal.getCreatedAt(), "score", meal.getHealthScore(), "grade", meal.getGrade())).toList();
        return Map.of("meals", rows, "total", page.getTotalElements(), "hasMore", page.getTotalElements() > (long) safeOffset + rows.size());
    }
}
