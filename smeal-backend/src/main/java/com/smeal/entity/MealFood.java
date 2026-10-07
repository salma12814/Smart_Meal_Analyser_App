package com.smeal.entity;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="meal_foods") public class MealFood {
 @Id private UUID id=UUID.randomUUID(); @ManyToOne(optional=false) @JoinColumn(name="meal_id") private Meal meal; @Column(name="food_name",nullable=false) private String foodName; @Column(nullable=false) private float confidence; @Column(name="calories_per_100g") private Float caloriesPer100g; @Column(nullable=false) private int position; protected MealFood(){} public MealFood(Meal meal,String name,float confidence,Float calories,int position){this.meal=meal;this.foodName=name;this.confidence=confidence;this.caloriesPer100g=calories;this.position=position;}
}
