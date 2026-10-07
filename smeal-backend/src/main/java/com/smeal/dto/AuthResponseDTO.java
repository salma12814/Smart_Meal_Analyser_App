package com.smeal.dto; import java.util.UUID; public record AuthResponseDTO(UUID userId,String token,String refreshToken,long expiresIn){}
