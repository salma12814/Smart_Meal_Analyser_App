package com.smeal.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import java.nio.charset.StandardCharsets; import java.time.Clock; import java.util.*; import javax.crypto.SecretKey; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
@Component public class JwtTokenProvider {
 private final SecretKey key; private final long expiry; private final Clock clock; public JwtTokenProvider(@Value("${jwt.secret}") String secret,@Value("${jwt.expiration-ms}") long expiry,Clock jwtClock){if(secret.getBytes(StandardCharsets.UTF_8).length<32)throw new IllegalArgumentException("jwt.secret must contain at least 32 bytes");this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));this.expiry=expiry;this.clock=jwtClock;}
 public String create(UUID id,String email,String role){Date now=Date.from(clock.instant());return Jwts.builder().setSubject(id.toString()).claim("email",email).claim("role",role).setIssuedAt(now).setExpiration(new Date(now.getTime()+expiry)).signWith(key,SignatureAlgorithm.HS256).compact();}
 public Claims parse(String token){return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();} public long getExpiry(){return expiry;}
}
