package com.stayhaven.api_gateway.users.restcontroller;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.users.dto.CreateUserRequest;
import com.stayhaven.api_gateway.users.dto.UpdateUserRequest;
import com.stayhaven.api_gateway.users.dto.UserDto;
import com.stayhaven.api_gateway.users.service.UserService;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<@NonNull ApiResponse<UserDto>> getUser(
            @PathVariable String userId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return userService.getUser(actor, userId);
    }

    @PostMapping
    public ResponseEntity<@NonNull ApiResponse<UserDto>> createUser(
            @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return userService.createUser(actor, request);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<@NonNull ApiResponse<UserDto>> updateUser(
            @PathVariable String userId,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return userService.updateUser(actor, userId, request);
    }
}
