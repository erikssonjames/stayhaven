package com.stayhaven.api_gateway.users.dto;

public record UserDto(
        String id,
        String email,
        String firstName,
        String lastName,
        String role
) {
}
