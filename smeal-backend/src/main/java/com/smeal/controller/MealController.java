package com.smeal.controller;

import com.smeal.dto.MealAnalysisDTO;
import com.smeal.entity.Meal;
import com.smeal.mapper.MealMapper;
import com.smeal.service.MealService;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/meals")
public class MealController {
    private final MealService service;
    private final MealMapper mapper;
    public MealController(MealService service, MealMapper mapper) { this.service = service; this.mapper = mapper; }
    private UUID userId(Authentication auth) { return UUID.fromString(auth.getName()); }

    @PostMapping("/analyze")
    public MealAnalysisDTO analyze(@RequestPart("image") MultipartFile image, Authentication auth) throws Exception {
        return service.analyze(image, userId(auth));
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable UUID id, Authentication auth) throws Exception {
        Meal meal = service.get(id, userId(auth));
        return mapper.toDetails(meal);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable UUID id, Authentication auth) {
        service.delete(id, userId(auth));
        return Map.of("success", true, "message", "Meal deleted");
    }
}
