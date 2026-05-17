package com.stayhaven.api_gateway.rentals.restcontroller;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.rentals.dto.CreateRentalRequest;
import com.stayhaven.api_gateway.rentals.dto.RentalDto;
import com.stayhaven.api_gateway.rentals.dto.UpdateRentalRequest;
import com.stayhaven.api_gateway.rentals.service.RentalService;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import java.util.List;
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
@RequestMapping("/api/hosts/{hostId}/rentals")
public class RentalController {
    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping
    public ResponseEntity<@NonNull ApiResponse<List<RentalDto>>> getRentals(
            @PathVariable String hostId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return rentalService.getRentals(actor, hostId);
    }

    @PostMapping
    public ResponseEntity<@NonNull ApiResponse<RentalDto>> createRental(
            @PathVariable String hostId,
            @RequestBody CreateRentalRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return rentalService.createRental(actor, hostId, request);
    }

    @PutMapping("/{rentalId}")
    public ResponseEntity<@NonNull ApiResponse<RentalDto>> updateRental(
            @PathVariable String hostId,
            @PathVariable String rentalId,
            @RequestBody UpdateRentalRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return rentalService.updateRental(actor, hostId, rentalId, request);
    }
}
