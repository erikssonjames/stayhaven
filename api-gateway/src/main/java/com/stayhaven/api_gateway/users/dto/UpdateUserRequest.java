package com.stayhaven.api_gateway.users.dto;

public record UpdateUserRequest(
        String email,
        String firstName,
        String lastName
) {
}
