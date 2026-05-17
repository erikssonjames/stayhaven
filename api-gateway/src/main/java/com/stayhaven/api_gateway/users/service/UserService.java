package com.stayhaven.api_gateway.users.service;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.roles.entity.RoleEntity;
import com.stayhaven.api_gateway.roles.repository.RoleRepository;
import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.security.AuthorizationService;
import com.stayhaven.api_gateway.users.dto.CreateUserRequest;
import com.stayhaven.api_gateway.users.dto.UpdateUserRequest;
import com.stayhaven.api_gateway.users.dto.UserDto;
import com.stayhaven.api_gateway.users.entity.UserEntity;
import com.stayhaven.api_gateway.users.entity.UserSettingsEntity;
import com.stayhaven.api_gateway.users.repository.UserRepository;
import com.stayhaven.api_gateway.users.repository.UserSettingsRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final AuthorizationService authorizationService;
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final RoleRepository roleRepository;

    public UserService(
            AuthorizationService authorizationService,
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository,
            RoleRepository roleRepository
    ) {
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.roleRepository = roleRepository;
    }

    public ResponseEntity<ApiResponse<UserDto>> getUser(AuthenticatedActor actor, String userId) {
        Optional<UUID> parsedUserId = parseUuid(userId);
        if (parsedUserId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("User id must be a valid UUID."));
        }

        authorizationService.requireSelfOrPermission(
                actor,
                parsedUserId.get(),
                RolePermission.USER_UPDATE_OWN,
                RolePermission.USER_MANAGE_ALL
        );

        return userRepository.findWithRoleById(parsedUserId.get())
                .map(user -> ResponseEntity.ok(ApiResponse.ok(toDto(user))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("User was not found.")));
    }

    @Transactional
    public ResponseEntity<ApiResponse<UserDto>> createUser(AuthenticatedActor actor, CreateUserRequest request) {
        authorizationService.require(actor, RolePermission.USER_CREATE);

        Optional<String> validationError = validate(request.email());
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        if (userRepository.findByEmail(request.email().trim()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail("Email is already in use."));
        }

        RoleEntity userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("USER role is not seeded."));
        UserEntity user = userRepository.save(new UserEntity(
                request.email().trim(),
                trimToNull(request.firstName()),
                trimToNull(request.lastName()),
                userRole
        ));
        userSettingsRepository.save(new UserSettingsEntity(user));

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toDto(user)));
    }

    @Transactional
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            AuthenticatedActor actor,
            String userId,
            UpdateUserRequest request
    ) {
        Optional<UUID> parsedUserId = parseUuid(userId);
        if (parsedUserId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("User id must be a valid UUID."));
        }

        authorizationService.requireSelfOrPermission(
                actor,
                parsedUserId.get(),
                RolePermission.USER_UPDATE_OWN,
                RolePermission.USER_MANAGE_ALL
        );

        Optional<String> validationError = validate(request.email());
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        Optional<UserEntity> user = userRepository.findById(parsedUserId.get());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("User was not found."));
        }

        String email = request.email().trim();
        Optional<UserEntity> existingEmailUser = userRepository.findByEmail(email);
        if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(parsedUserId.get())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail("Email is already in use."));
        }

        UserEntity existingUser = user.get();
        existingUser.setEmail(email);
        existingUser.setFirstName(trimToNull(request.firstName()));
        existingUser.setLastName(trimToNull(request.lastName()));

        return ResponseEntity.ok(ApiResponse.ok(toDto(userRepository.save(existingUser))));
    }

    private Optional<UUID> parseUuid(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private Optional<String> validate(String email) {
        if (email == null || email.isBlank()) {
            return Optional.of("Email is required.");
        }
        return Optional.empty();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private UserDto toDto(UserEntity user) {
        return new UserDto(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().getName()
        );
    }
}
