package com.stayhaven.api_gateway.auth.dto;

public record LoginRequest(
        String email,
        String password
) {
}
