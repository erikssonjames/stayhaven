package com.stayhaven.api_gateway.security;

import com.stayhaven.api_gateway.auth.service.AuthTokenService;
import com.stayhaven.api_gateway.hosts.repository.HostRepository;
import com.stayhaven.api_gateway.users.entity.UserEntity;
import com.stayhaven.api_gateway.users.repository.UserRepository;
import com.stayhaven.api_gateway.users.types.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ActorAuthenticationFilter extends OncePerRequestFilter {
    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthTokenService authTokenService;
    private final UserRepository userRepository;
    private final HostRepository hostRepository;

    public ActorAuthenticationFilter(
            AuthTokenService authTokenService,
            UserRepository userRepository,
            HostRepository hostRepository
    ) {
        this.authTokenService = authTokenService;
        this.userRepository = userRepository;
        this.hostRepository = hostRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String bearerToken = resolveBearerToken(request);
        if (bearerToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        authTokenService.validateToken(bearerToken)
                .flatMap(userRepository::findWithRoleById)
                .ifPresent(user -> authenticate(user, resolveHostId(user)));

        filterChain.doFilter(request, response);
    }

    private String resolveBearerToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return authorizationHeader.substring(BEARER_PREFIX.length()).trim();
    }

    private void authenticate(UserEntity user, UUID hostId) {
        UserRole role = UserRole.valueOf(user.getRole().getName());
        AuthenticatedActor actor = new AuthenticatedActor(user.getId(), role, hostId);
        ActorAuthenticationToken authentication = new ActorAuthenticationToken(
                actor,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private UUID resolveHostId(UserEntity user) {
        return hostRepository.findByUserId(user.getId())
                .map(host -> host.getId())
                .orElse(null);
    }
}
