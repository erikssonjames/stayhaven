package com.stayhaven.api_gateway.rentals.service;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.hosts.entity.HostEntity;
import com.stayhaven.api_gateway.hosts.repository.HostRepository;
import com.stayhaven.api_gateway.hosts.types.HostStatus;
import com.stayhaven.api_gateway.rentals.dto.CreateRentalRequest;
import com.stayhaven.api_gateway.rentals.dto.PublicRentalDto;
import com.stayhaven.api_gateway.rentals.dto.RentalDto;
import com.stayhaven.api_gateway.rentals.dto.UpdateRentalRequest;
import com.stayhaven.api_gateway.rentals.entity.RentalEntity;
import com.stayhaven.api_gateway.rentals.repository.RentalRepository;
import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.security.AuthorizationService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RentalService {
    private final AuthorizationService authorizationService;
    private final HostRepository hostRepository;
    private final RentalRepository rentalRepository;

    public RentalService(
            AuthorizationService authorizationService,
            HostRepository hostRepository,
            RentalRepository rentalRepository
    ) {
        this.authorizationService = authorizationService;
        this.hostRepository = hostRepository;
        this.rentalRepository = rentalRepository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<PublicRentalDto>>> getAvailableRentals() {
        List<PublicRentalDto> rentals = rentalRepository.findByHostStatusOrderByCreatedAtDesc(HostStatus.ACTIVE)
                .stream()
                .map(this::toPublicDto)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    public ResponseEntity<ApiResponse<List<RentalDto>>> getRentals(AuthenticatedActor actor, String hostId) {
        Optional<UUID> parsedHostId = parseUuid(hostId);
        if (parsedHostId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Host id must be a valid UUID."));
        }

        authorizationService.requireOwnHostOrPermission(
                actor,
                parsedHostId.get(),
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.RENTAL_MANAGE_ALL
        );

        if (!hostRepository.existsById(parsedHostId.get())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Host was not found."));
        }

        List<RentalDto> rentals = rentalRepository.findByHostId(parsedHostId.get())
                .stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @Transactional
    public ResponseEntity<ApiResponse<RentalDto>> createRental(
            AuthenticatedActor actor,
            String hostId,
            CreateRentalRequest request
    ) {
        Optional<UUID> parsedHostId = parseUuid(hostId);
        if (parsedHostId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Host id must be a valid UUID."));
        }

        authorizationService.requireOwnHostOrPermission(
                actor,
                parsedHostId.get(),
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.RENTAL_MANAGE_ALL
        );

        Optional<String> validationError = validate(request.name(), request.pricePerNight());
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        Optional<HostEntity> host = hostRepository.findById(parsedHostId.get());
        if (host.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Host was not found."));
        }

        RentalEntity rental = new RentalEntity(
                host.get(),
                request.name().trim(),
                request.description(),
                request.pricePerNight()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toDto(rentalRepository.save(rental))));
    }

    @Transactional
    public ResponseEntity<ApiResponse<RentalDto>> updateRental(
            AuthenticatedActor actor,
            String hostId,
            String rentalId,
            UpdateRentalRequest request
    ) {
        Optional<UUID> parsedHostId = parseUuid(hostId);
        Optional<UUID> parsedRentalId = parseUuid(rentalId);
        if (parsedHostId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Host id must be a valid UUID."));
        }
        if (parsedRentalId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Rental id must be a valid UUID."));
        }

        authorizationService.requireOwnHostOrPermission(
                actor,
                parsedHostId.get(),
                RolePermission.RENTAL_MANAGE_OWN,
                RolePermission.RENTAL_MANAGE_ALL
        );

        Optional<String> validationError = validate(request.name(), request.pricePerNight());
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        Optional<RentalEntity> rental = rentalRepository.findByIdAndHostId(parsedRentalId.get(), parsedHostId.get());
        if (rental.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Rental was not found for this host."));
        }

        RentalEntity existingRental = rental.get();
        existingRental.setName(request.name().trim());
        existingRental.setDescription(request.description());
        existingRental.setPricePerNight(request.pricePerNight());

        return ResponseEntity.ok(ApiResponse.ok(toDto(rentalRepository.save(existingRental))));
    }

    private Optional<UUID> parseUuid(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private Optional<String> validate(String name, BigDecimal pricePerNight) {
        if (name == null || name.isBlank()) {
            return Optional.of("Rental name is required.");
        }
        if (pricePerNight == null || pricePerNight.signum() <= 0) {
            return Optional.of("Price per night must be greater than zero.");
        }
        return Optional.empty();
    }

    private RentalDto toDto(RentalEntity rental) {
        return new RentalDto(
                rental.getId().toString(),
                rental.getHost().getId().toString(),
                rental.getName(),
                rental.getDescription(),
                rental.getPricePerNight()
        );
    }

    private PublicRentalDto toPublicDto(RentalEntity rental) {
        return new PublicRentalDto(
                rental.getId().toString(),
                rental.getHost().getId().toString(),
                rental.getHost().getDisplayName(),
                rental.getName(),
                rental.getDescription(),
                rental.getPricePerNight()
        );
    }
}
