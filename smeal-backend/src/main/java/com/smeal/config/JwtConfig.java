package com.smeal.config;
import java.time.Clock; import org.springframework.context.annotation.*;
@Configuration public class JwtConfig {@Bean Clock jwtClock(){return Clock.systemUTC();}}
