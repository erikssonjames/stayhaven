package com.stayhaven.api_gateway.security;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.users.types.UserRole;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class AuthorizationServiceTests {
    private final AuthorizationService authorizationService = new AuthorizationService();

    @Test
    void allowsOwnHostMutationForHostActor() {
        UUID hostId = UUID.randomUUID();
        AuthenticatedActor actor = new AuthenticatedActor(UUID.randomUUID(), UserRole.HOST, hostId);

        assertThatCode(() -> authorizationService.requireOwnHostOrPermission(
                actor,
                hostId,
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.RENTAL_MANAGE_ALL
        )).doesNotThrowAnyException();
    }

    @Test
    void rejectsOtherHostMutationForHostActor() {
        AuthenticatedActor actor = new AuthenticatedActor(UUID.randomUUID(), UserRole.HOST, UUID.randomUUID());

        assertThatThrownBy(() -> authorizationService.requireOwnHostOrPermission(
                actor,
                UUID.randomUUID(),
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.RENTAL_MANAGE_ALL
        )).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void allowsAllHostMutationForAdminActor() {
        AuthenticatedActor actor = new AuthenticatedActor(UUID.randomUUID(), UserRole.ADMIN, null);

        assertThatCode(() -> authorizationService.requireOwnHostOrPermission(
                actor,
                UUID.randomUUID(),
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.RENTAL_MANAGE_ALL
        )).doesNotThrowAnyException();
    }
}
