package com.stayhaven.api_gateway.users.dto;

public record CreateUserRequest(
        String email,
        String firstName,
        String lastName
) {
}
