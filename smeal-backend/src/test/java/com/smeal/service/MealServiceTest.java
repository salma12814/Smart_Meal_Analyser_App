package com.smeal.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smeal.dto.FoodPredictionDTO;
import com.smeal.dto.RecommendationDTO;
import com.smeal.entity.*;
import com.smeal.mapper.MealMapper;
import com.smeal.repository.*;
import com.smeal.util.ImageValidator;
import java.nio.file.Path;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockMultipartFile;

class MealServiceTest {
    @TempDir Path temp;

    @Test void analyzePersistsMealForAuthenticatedOwnerAndCachesPrediction() throws Exception {
        var meals = mock(MealRepository.class); var mealFoods = mock(MealFoodRepository.class);
        var users = mock(UserRepository.class); var nutrition = mock(NutritionRepository.class);
        var ml = mock(MLIntegrationService.class); var scores = new HealthScoreService();
        var validator = mock(ImageValidator.class); var redis = mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked") ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        when(values.get(anyString())).thenReturn(null);
        when(ml.analyze(any(), anyString(), anyString())).thenReturn(List.of(new FoodPredictionDTO("test_food", .92)));
        when(ml.recommend(anyList())).thenReturn(List.of(new RecommendationDTO("test_food", "Add variety", 0.8)));
        User owner = new User("user@example.com", "hash", "User");
        when(users.findById(owner.getId())).thenReturn(Optional.of(owner));
        NutritionData food = mock(NutritionData.class);
        when(food.getCaloriesPer100g()).thenReturn(220f); when(food.getProteins()).thenReturn(12f);
        when(food.getCarbs()).thenReturn(20f); when(food.getFats()).thenReturn(5f); when(food.getFiber()).thenReturn(5f);
        when(food.getSodium()).thenReturn(200f); when(food.getSugarTotal()).thenReturn(2f);
        when(nutrition.findByFoodNameIgnoreCase("test_food")).thenReturn(Optional.of(food));
        when(meals.save(any(Meal.class))).thenAnswer(inv -> inv.getArgument(0));
        var service = new MealService(meals, mealFoods, users, nutrition, ml, scores, validator,
                new ObjectMapper(), redis, temp.toString());
        var upload = new MockMultipartFile("image", "meal.jpg", "image/jpeg", new byte[]{1, 2, 3});

        var result = service.analyze(upload, owner.getId());

        assertNotNull(result.mealId());
        assertEquals(owner.getId(), result.userId());
        assertEquals("test_food", result.detectedFoods().get(0).food());
        var savedMeal = org.mockito.ArgumentCaptor.forClass(Meal.class);
        verify(meals).save(savedMeal.capture());
        Meal persisted = savedMeal.getValue();
        assertTrue(persisted.getDetectedFoodsJson().isArray());
        assertEquals("test_food", persisted.getDetectedFoodsJson().path(0).path("food").asText());
        assertEquals(220d, persisted.getNutritionDataJson().path("calories").asDouble());
        assertEquals("Add variety", persisted.getRecommendationsJson().path(0).path("reason").asText());
        Map<String, Object> details = new MealMapper().toDetails(persisted);
        JsonNode detailsFoods = (JsonNode) details.get("detectedFoods");
        assertEquals("test_food", detailsFoods.path(0).path("food").asText());
        assertEquals(220d, ((JsonNode) details.get("nutritionData")).path("calories").asDouble());
        assertEquals("Add variety", ((JsonNode) details.get("recommendations")).path(0).path("reason").asText());
        verify(values).set(startsWith("meal:classify:"), anyString(), any(java.time.Duration.class));
        verify(mealFoods).saveAll(anyList());
    }
}
