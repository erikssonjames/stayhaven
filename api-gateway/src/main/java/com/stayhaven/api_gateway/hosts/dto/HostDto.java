package com.stayhaven.api_gateway.hosts.dto;

public record HostDto(
        String id,
        String userId,
        String displayName,
        String bio
) {
}
