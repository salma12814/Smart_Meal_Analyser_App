package com.smeal.service; import com.smeal.dto.HealthScoreDTO; import com.smeal.util.HealthScoreCalculator; import java.util.Map; import org.springframework.stereotype.Service;
@Service public class HealthScoreService {public HealthScoreDTO calculate(Map<String,Double> nutrition){return HealthScoreCalculator.calculate(nutrition);}}
