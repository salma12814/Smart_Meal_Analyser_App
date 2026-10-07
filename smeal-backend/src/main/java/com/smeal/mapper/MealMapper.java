package com.smeal.mapper;

import com.smeal.entity.Meal;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MealMapper {
    public Map<String, Object> toDetails(Meal meal) {
        return Map.of("mealId", meal.getId(), "userId", meal.getUser().getId(),
                "detectedFoods", meal.getDetectedFoodsJson(),
                "nutritionData", meal.getNutritionDataJson(),
                "healthScore", Map.of("score", meal.getHealthScore(), "grade", meal.getGrade()),
                "recommendations", meal.getRecommendationsJson(), "timestamp", meal.getCreatedAt());
    }
}
