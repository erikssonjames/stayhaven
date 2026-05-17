package com.stayhaven.api_gateway.hosts.dto;

public record CreateHostRequest(
        String userId,
        String displayName,
        String bio
) {
}
