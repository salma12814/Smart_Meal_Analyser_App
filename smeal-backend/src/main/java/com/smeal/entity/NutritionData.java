package com.smeal.entity;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="nutrition_data") public class NutritionData {
 @Id private UUID id=UUID.randomUUID(); @Column(name="food_name",unique=true,nullable=false) private String foodName; @Column(name="calories_per_100g") private float caloriesPer100g; private float proteins,carbs,fats,fiber,sodium; @Column(name="sugar_total") private float sugarTotal;
 protected NutritionData(){} public String getFoodName(){return foodName;} public float getCaloriesPer100g(){return caloriesPer100g;} public float getProteins(){return proteins;} public float getCarbs(){return carbs;} public float getFats(){return fats;} public float getFiber(){return fiber;} public float getSodium(){return sodium;} public float getSugarTotal(){return sugarTotal;}
}
