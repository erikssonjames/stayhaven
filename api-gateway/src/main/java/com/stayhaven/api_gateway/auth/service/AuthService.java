package com.stayhaven.api_gateway.auth.service;

import com.stayhaven.api_gateway.auth.dto.AuthResponse;
import com.stayhaven.api_gateway.auth.dto.LoginRequest;
import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.users.dto.UserDto;
import com.stayhaven.api_gateway.users.entity.UserEntity;
import com.stayhaven.api_gateway.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthTokenService authTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
    }

    public ResponseEntity<ApiResponse<AuthResponse>> login(LoginRequest request) {
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Email and password are required."));
        }

        var users = userRepository.findByEmail(request.email().trim());
        var filteredUsers = users.map(user -> ResponseEntity.ok(ApiResponse.ok(new AuthResponse(
            authTokenService.issueToken(user.getId()),
            toDto(user)
        ))));

        return filteredUsers.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Invalid email or password.")));
    }

    public ResponseEntity<ApiResponse<UserDto>> me(AuthenticatedActor actor) {
        return userRepository.findWithRoleById(actor.userId())
                .map(user -> ResponseEntity.ok(ApiResponse.ok(toDto(user))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Authenticated user was not found.")));
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
