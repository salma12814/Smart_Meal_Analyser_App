package com.smeal.dto; import java.util.Map; public record HealthScoreDTO(int score,String grade,Map<String,Integer> breakdown){}
