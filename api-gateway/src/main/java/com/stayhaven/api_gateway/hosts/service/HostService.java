package com.stayhaven.api_gateway.hosts.service;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.hosts.dto.CreateHostRequest;
import com.stayhaven.api_gateway.hosts.dto.HostDto;
import com.stayhaven.api_gateway.hosts.entity.HostEntity;
import com.stayhaven.api_gateway.hosts.repository.HostRepository;
import com.stayhaven.api_gateway.hosts.types.HostStatus;
import com.stayhaven.api_gateway.roles.entity.RoleEntity;
import com.stayhaven.api_gateway.roles.repository.RoleRepository;
import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.security.AuthorizationService;
import com.stayhaven.api_gateway.users.entity.UserEntity;
import com.stayhaven.api_gateway.users.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HostService {
    private final AuthorizationService authorizationService;
    private final HostRepository hostRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public HostService(
            AuthorizationService authorizationService,
            HostRepository hostRepository,
            UserRepository userRepository,
            RoleRepository roleRepository
    ) {
        this.authorizationService = authorizationService;
        this.hostRepository = hostRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public ResponseEntity<ApiResponse<HostDto>> getHost(AuthenticatedActor actor, String hostId) {
        Optional<UUID> parsedHostId = parseUuid(hostId);
        if (parsedHostId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Host id must be a valid UUID."));
        }

        authorizationService.requireOwnHostOrPermission(
                actor,
                parsedHostId.get(),
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.HOST_MANAGE_ALL
        );

        return hostRepository.findById(parsedHostId.get())
                .map(host -> ResponseEntity.ok(ApiResponse.ok(toDto(host))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Host was not found.")));
    }

    @Transactional
    public ResponseEntity<ApiResponse<HostDto>> createHost(AuthenticatedActor actor, CreateHostRequest request) {
        authorizationService.require(actor, RolePermission.HOST_CREATE);

        Optional<UUID> parsedUserId = parseUuid(request.userId());
        if (parsedUserId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("User id must be a valid UUID."));
        }
        if (request.displayName() == null || request.displayName().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Display name is required."));
        }

        Optional<UserEntity> user = userRepository.findById(parsedUserId.get());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("User was not found."));
        }
        if (hostRepository.findByUserId(parsedUserId.get()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail("User is already a host."));
        }

        RoleEntity hostRole = roleRepository.findByName("HOST")
                .orElseThrow(() -> new IllegalStateException("HOST role is not seeded."));
        UserEntity hostUser = user.get();
        hostUser.setRole(hostRole);
        userRepository.save(hostUser);

        HostEntity host = new HostEntity(hostUser, request.displayName().trim(), request.bio());
        host.setStatus(HostStatus.PENDING_REVIEW);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toDto(hostRepository.save(host))));
    }

    @Transactional
    public ResponseEntity<ApiResponse<HostDto>> acceptHost(AuthenticatedActor actor, String hostId) {
        authorizationService.require(actor, RolePermission.HOST_ACCEPT);

        Optional<UUID> parsedHostId = parseUuid(hostId);
        if (parsedHostId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Host id must be a valid UUID."));
        }

        Optional<HostEntity> host = hostRepository.findById(parsedHostId.get());
        if (host.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Host was not found."));
        }

        HostEntity existingHost = host.get();
        existingHost.setStatus(HostStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.ok(toDto(hostRepository.save(existingHost))));
    }

    private Optional<UUID> parseUuid(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private HostDto toDto(HostEntity host) {
        return new HostDto(
                host.getId().toString(),
                host.getUser().getId().toString(),
                host.getDisplayName(),
                host.getBio()
        );
    }
}
