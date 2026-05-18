package com.stayhaven.api_gateway.auth.dto;

import com.stayhaven.api_gateway.users.dto.UserDto;

public record AuthResponse(
        String token,
        UserDto user
) {
}
