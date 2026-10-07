package com.smeal.controller; import java.time.Instant;import java.util.Map;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/v1") public class HealthController {@GetMapping("/health")public Map<String,Object> health(){return Map.of("status","UP","timestamp",Instant.now(),"version","1.0.0");}}
