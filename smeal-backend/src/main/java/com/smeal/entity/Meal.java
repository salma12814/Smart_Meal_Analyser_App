package com.smeal.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "meals")
public class Meal {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_hash", nullable = false, length = 64)
    private String imageHash;

    @Column(name = "image_url")
    private String imageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "detected_foods_json", columnDefinition = "jsonb", nullable = false)
    private JsonNode detectedFoodsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "nutrition_data_json", columnDefinition = "jsonb", nullable = false)
    private JsonNode nutritionDataJson;

    @Column(name = "health_score", nullable = false)
    private int healthScore;

    @Column(nullable = false, length = 1)
    private String grade;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations_json", columnDefinition = "jsonb", nullable = false)
    private JsonNode recommendationsJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    protected Meal() {}

    public Meal(User user, String imageHash, String imageUrl, JsonNode detectedFoodsJson,
                JsonNode nutritionDataJson, int healthScore, String grade, JsonNode recommendationsJson) {
        this.user = user;
        this.imageHash = imageHash;
        this.imageUrl = imageUrl;
        this.detectedFoodsJson = detectedFoodsJson;
        this.nutritionDataJson = nutritionDataJson;
        this.healthScore = healthScore;
        this.grade = grade;
        this.recommendationsJson = recommendationsJson;
    }

    @PreUpdate
    void touch() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public String getImageHash() { return imageHash; }
    public String getImageUrl() { return imageUrl; }
    public JsonNode getDetectedFoodsJson() { return detectedFoodsJson; }
    public JsonNode getNutritionDataJson() { return nutritionDataJson; }
    public int getHealthScore() { return healthScore; }
    public String getGrade() { return grade; }
    public JsonNode getRecommendationsJson() { return recommendationsJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
