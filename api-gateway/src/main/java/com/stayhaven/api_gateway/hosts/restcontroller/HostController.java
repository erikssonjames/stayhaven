package com.stayhaven.api_gateway.hosts.restcontroller;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.hosts.dto.CreateHostRequest;
import com.stayhaven.api_gateway.hosts.dto.HostDto;
import com.stayhaven.api_gateway.hosts.service.HostService;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
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
@RequestMapping("/api/hosts")
public class HostController {
    private final HostService hostService;

    public HostController(HostService hostService) {
        this.hostService = hostService;
    }

    @GetMapping("/{hostId}")
    public ResponseEntity<@NonNull ApiResponse<HostDto>> getHost(
            @PathVariable String hostId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return hostService.getHost(actor, hostId);
    }

    @PostMapping
    public ResponseEntity<@NonNull ApiResponse<HostDto>> createHost(
            @RequestBody CreateHostRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return hostService.createHost(actor, request);
    }

    @PutMapping("/{hostId}/accept")
    public ResponseEntity<@NonNull ApiResponse<HostDto>> acceptHost(
            @PathVariable String hostId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return hostService.acceptHost(actor, hostId);
    }
}
