package com.stayhaven.api_gateway.security;

import com.stayhaven.api_gateway.users.types.UserRole;
import java.util.Optional;
import java.util.UUID;

public record AuthenticatedActor(
        UUID userId,
        UserRole role,
        UUID hostId
) {
    public Optional<UUID> hostIdOptional() {
        return Optional.ofNullable(hostId);
    }
}
