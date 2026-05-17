package com.stayhaven.api_gateway.security;

import com.stayhaven.api_gateway.roles.service.RolePolicy;
import com.stayhaven.api_gateway.roles.types.RolePermission;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthorizationService {
    public void require(AuthenticatedActor actor, RolePermission permission) {
        if (actor == null || !RolePolicy.hasPermission(actor.role(), permission)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to perform this action.");
        }
    }

    public void requireSelfOrPermission(AuthenticatedActor actor, UUID userId, RolePermission selfPermission,
            RolePermission allPermission) {
        if (actor != null && actor.userId().equals(userId) && RolePolicy.hasPermission(actor.role(), selfPermission)) {
            return;
        }

        require(actor, allPermission);
    }

    public void requireOwnHostOrPermission(AuthenticatedActor actor, UUID hostId, RolePermission ownPermission,
            RolePermission allPermission) {
        if (actor != null
                && actor.hostId() != null
                && actor.hostId().equals(hostId)
                && RolePolicy.hasPermission(actor.role(), ownPermission)) {
            return;
        }

        require(actor, allPermission);
    }
}
