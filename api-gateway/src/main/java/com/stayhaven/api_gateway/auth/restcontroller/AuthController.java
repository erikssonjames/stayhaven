package com.stayhaven.api_gateway.auth.restcontroller;

import com.stayhaven.api_gateway.auth.dto.AuthResponse;
import com.stayhaven.api_gateway.auth.dto.LoginRequest;
import com.stayhaven.api_gateway.auth.service.AuthService;
import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.users.dto.UserDto;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<@NonNull ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public ResponseEntity<@NonNull ApiResponse<UserDto>> me(@AuthenticationPrincipal AuthenticatedActor actor) {
        return authService.me(actor);
    }
}
