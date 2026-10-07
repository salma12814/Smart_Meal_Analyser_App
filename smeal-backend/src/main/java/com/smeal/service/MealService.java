package com.smeal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smeal.dto.*;
import com.smeal.entity.*;
import com.smeal.repository.*;
import com.smeal.exception.ResourceNotFoundException;
import com.smeal.util.ImageValidator;
import com.smeal.util.OffsetPageRequest;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MealService {
    private static final TypeReference<List<FoodPredictionDTO>> FOOD_LIST = new TypeReference<>() {};
    private final MealRepository meals;
    private final MealFoodRepository mealFoods;
    private final UserRepository users;
    private final NutritionRepository nutrition;
    private final MLIntegrationService ml;
    private final HealthScoreService scores;
    private final ImageValidator imageValidator;
    private final ObjectMapper mapper;
    private final StringRedisTemplate redis;
    private final Path storagePath;

    public MealService(MealRepository meals, MealFoodRepository mealFoods, UserRepository users,
                       NutritionRepository nutrition, MLIntegrationService ml, HealthScoreService scores,
                       ImageValidator imageValidator, ObjectMapper mapper, StringRedisTemplate redis,
                       @Value("${file.upload.storage-path}") String storagePath) {
        this.meals = meals;
        this.mealFoods = mealFoods;
        this.users = users;
        this.nutrition = nutrition;
        this.ml = ml;
        this.scores = scores;
        this.imageValidator = imageValidator;
        this.mapper = mapper;
        this.redis = redis;
        this.storagePath = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @Transactional
    public MealAnalysisDTO analyze(MultipartFile file, UUID userId) throws Exception {
        imageValidator.validate(file);
        byte[] bytes = file.getBytes();
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        String cacheKey = "meal:classify:" + hash;
        String cached = redis.opsForValue().get(cacheKey);
        List<FoodPredictionDTO> foods;
        if (cached != null) {
            foods = mapper.readValue(cached, FOOD_LIST);
        } else {
            foods = ml.analyze(bytes, "meal." + extension(file.getContentType()), file.getContentType());
            redis.opsForValue().set(cacheKey, mapper.writeValueAsString(foods), java.time.Duration.ofMinutes(30));
        }

        Map<String, Double> totals = new LinkedHashMap<>();
        for (String key : List.of("calories", "proteins", "carbs", "fats", "fiber", "sodium", "sugarTotal")) totals.put(key, 0d);
        Map<String, NutritionData> nutritionByName = new HashMap<>();
        for (FoodPredictionDTO food : foods) {
            nutrition.findByFoodNameIgnoreCase(food.food()).ifPresent(data -> {
                nutritionByName.put(food.food(), data);
                totals.compute("calories", (k, v) -> v + data.getCaloriesPer100g());
                totals.compute("proteins", (k, v) -> v + data.getProteins());
                totals.compute("carbs", (k, v) -> v + data.getCarbs());
                totals.compute("fats", (k, v) -> v + data.getFats());
                totals.compute("fiber", (k, v) -> v + data.getFiber());
                totals.compute("sodium", (k, v) -> v + data.getSodium());
                totals.compute("sugarTotal", (k, v) -> v + data.getSugarTotal());
            });
        }
        HealthScoreDTO score = scores.calculate(totals);
        List<RecommendationDTO> recommendations = ml.recommend(foods.stream().map(FoodPredictionDTO::food).toList());
        User user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Files.createDirectories(storagePath);
        Path stored = storagePath.resolve(hash + "." + extension(file.getContentType())).normalize();
        if (!stored.startsWith(storagePath)) throw new IllegalArgumentException("Invalid upload path");
        if (!Files.exists(stored)) Files.write(stored, bytes, StandardOpenOption.CREATE_NEW);

        JsonNode detectedFoodsJson = mapper.valueToTree(foods);
        JsonNode nutritionDataJson = mapper.valueToTree(totals);
        JsonNode recommendationsJson = mapper.valueToTree(recommendations);
        Meal meal = meals.save(new Meal(user, hash, stored.toString(), detectedFoodsJson,
                nutritionDataJson, score.score(), score.grade(), recommendationsJson));
        List<MealFood> rows = new ArrayList<>();
        for (int i = 0; i < foods.size(); i++) {
            FoodPredictionDTO food = foods.get(i);
            NutritionData data = nutritionByName.get(food.food());
            rows.add(new MealFood(meal, food.food(), (float) food.confidence(), data == null ? null : data.getCaloriesPer100g(), i));
        }
        mealFoods.saveAll(rows);
        return new MealAnalysisDTO(meal.getId(), userId, foods, totals, score, recommendations, meal.getCreatedAt());
    }

    private String extension(String contentType) { return "image/png".equalsIgnoreCase(contentType) ? "png" : "jpg"; }
    public Meal get(UUID id, UUID user) { return meals.findByIdAndUserId(id, user).orElseThrow(() -> new ResourceNotFoundException("Meal not found")); }
    public Page<Meal> history(UUID user, int offset, int size) { int safeSize = Math.min(100, Math.max(1, size)); return meals.findByUserId(user, new OffsetPageRequest(Math.max(0, offset), safeSize, Sort.by("createdAt").descending())); }
    public void delete(UUID id, UUID user) { meals.delete(get(id, user)); }
}
