package com.smeal.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.smeal.dto.AuthRequestDTO;
import com.smeal.entity.User;
import com.smeal.exception.UnauthorizedException;
import com.smeal.repository.UserRepository;
import com.smeal.security.JwtTokenProvider;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository users;
    @Mock PasswordEncoder encoder;
    @Mock JwtTokenProvider jwt;
    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> values;

    private AuthService service() { return new AuthService(users, encoder, jwt, redis, 604800000L); }

    @Test void registrationHashesPasswordAndIssuesRefreshToken() {
        when(users.findByEmailIgnoreCase("a@example.com")).thenReturn(Optional.empty());
        when(encoder.encode("long-password")).thenReturn("bcrypt-hash");
        when(users.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwt.create(any(), eq("a@example.com"), eq("USER"))).thenReturn("access-token");
        when(jwt.getExpiry()).thenReturn(86400000L);
        when(redis.opsForValue()).thenReturn(values);

        var response = service().register(new AuthRequestDTO("a@example.com", "long-password", "A User"));

        assertNotNull(response.userId());
        assertEquals("access-token", response.token());
        assertEquals(86400, response.expiresIn());
        verify(encoder).encode("long-password");
        verify(values).set(startsWith("refresh:"), anyString(), any(Duration.class));
    }

    @Test void invalidLoginDoesNotRevealWhetherEmailExists() {
        when(users.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class, () -> service().login(new AuthRequestDTO("missing@example.com", "long-password", null)));
    }
}
