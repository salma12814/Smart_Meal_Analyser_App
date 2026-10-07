package com.smeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.smeal.dto.FoodPredictionDTO;
import com.smeal.dto.RecommendationDTO;
import com.smeal.exception.MLServiceException;
import com.smeal.util.MLClient;
import java.io.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

@Service
public class MLIntegrationService {
    private final MLClient client;
    private final String detect, classify, recommend;
    public MLIntegrationService(MLClient client,
                                @Value("${ml.api.detect-endpoint}") String detect,
                                @Value("${ml.api.classify-endpoint}") String classify,
                                @Value("${ml.api.recommend-endpoint}") String recommend) {
        this.client = client; this.detect = detect; this.classify = classify; this.recommend = recommend;
    }

    public List<FoodPredictionDTO> analyze(byte[] image, String filename, String contentType) {
        try {
            JsonNode detected = client.postImage(detect, image, filename, contentType);
            List<FoodPredictionDTO> result = new ArrayList<>();
            JsonNode objects = detected.path("objects");
            if (objects.isArray() && !objects.isEmpty()) {
                for (JsonNode object : objects) {
                    byte[] region = crop(image, object.path("box"));
                    JsonNode prediction = client.postImage(classify, region == null ? image : region,
                            region == null ? filename : "crop.jpg", region == null ? contentType : "image/jpeg");
                    if (prediction.has("class")) result.add(new FoodPredictionDTO(prediction.path("class").asText(), prediction.path("probability").asDouble()));
                }
            } else {
                JsonNode prediction = client.postImage(classify, image, filename, contentType);
                if (prediction.has("class")) result.add(new FoodPredictionDTO(prediction.path("class").asText(), prediction.path("probability").asDouble()));
            }
            return result;
        } catch (RestClientException e) {
            throw new MLServiceException("ML service unavailable", e);
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid image", e);
        }
    }

    private byte[] crop(byte[] bytes, JsonNode box) throws IOException {
        if (!box.isArray() || box.size() < 4) return null;
        java.awt.image.BufferedImage source = javax.imageio.ImageIO.read(new ByteArrayInputStream(bytes));
        if (source == null) return null;
        int x1 = Math.max(0, (int) box.get(0).asDouble()), y1 = Math.max(0, (int) box.get(1).asDouble());
        int x2 = Math.min(source.getWidth(), (int) box.get(2).asDouble()), y2 = Math.min(source.getHeight(), (int) box.get(3).asDouble());
        if (x2 <= x1 || y2 <= y1) return null;
        java.awt.image.BufferedImage region = source.getSubimage(x1, y1, x2 - x1, y2 - y1);
        java.awt.image.BufferedImage rgb = new java.awt.image.BufferedImage(region.getWidth(), region.getHeight(), java.awt.image.BufferedImage.TYPE_INT_RGB);
        rgb.getGraphics().drawImage(region, 0, 0, null);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(rgb, "jpg", output);
        return output.toByteArray();
    }

    public List<RecommendationDTO> recommend(List<String> foods) {
        try {
            JsonNode root = client.postJson(recommend, Map.of("selectedFoods", foods));
            List<RecommendationDTO> result = new ArrayList<>();
            if (root != null && root.path("suggestions").isArray()) root.path("suggestions").forEach(node ->
                    result.add(new RecommendationDTO(node.path("food").asText(), node.path("reason").asText(""), node.path("scoreBoost").asDouble())));
            return result;
        } catch (RestClientException e) {
            throw new MLServiceException("ML service unavailable", e);
        }
    }
}
