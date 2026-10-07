package com.smeal.config;
import org.springframework.context.annotation.*; import org.springframework.data.redis.connection.RedisConnectionFactory; import org.springframework.data.redis.core.StringRedisTemplate;
@Configuration public class RedisConfig {@Bean StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory){return new StringRedisTemplate(connectionFactory);}}
