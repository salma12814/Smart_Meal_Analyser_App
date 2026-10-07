package com.smeal.util;
import com.smeal.dto.HealthScoreDTO; import java.util.Map;
public final class HealthScoreCalculator {
 private HealthScoreCalculator(){}
 public static HealthScoreDTO calculate(Map<String,Double> nutrition){
  double proteinValue=nutrition.getOrDefault("proteins",0d), fiberValue=nutrition.getOrDefault("fiber",0d), caloriesValue=nutrition.getOrDefault("calories",0d);
  int protein=proteinValue>=20?20:proteinValue>=10?10:0, fiber=fiberValue>=5?15:0;
  int calories=caloriesValue>=150&&caloriesValue<=300?10:caloriesValue>400?-20:0;
  int fat=nutrition.getOrDefault("fats",0d)>20?-15:0, sugar=nutrition.getOrDefault("sugarTotal",0d)>15?-15:0, sodium=nutrition.getOrDefault("sodium",0d)>600?-20:0;
  int score=Math.max(0,Math.min(100,50+protein+fiber+calories+fat+sugar+sodium));
  String grade=score>=80?"A":score>=65?"B":score>=50?"C":score>=35?"D":"E";
  return new HealthScoreDTO(score,grade,Map.of("base",50,"protein",protein,"fiber",fiber,"calories",calories,"fat",fat,"sugar",sugar,"sodium",sodium));
 }
}
