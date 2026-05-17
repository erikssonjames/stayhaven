package com.stayhaven.api_gateway.payments.service;

import com.stayhaven.api_gateway.bookings.entity.BookingEntity;
import com.stayhaven.api_gateway.bookings.service.BookingService;
import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.payments.dto.CreatePaymentRequest;
import com.stayhaven.api_gateway.payments.dto.PaymentDto;
import com.stayhaven.api_gateway.payments.entity.PaymentEntity;
import com.stayhaven.api_gateway.payments.repository.PaymentRepository;
import com.stayhaven.api_gateway.payments.types.PaymentStatus;
import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.security.AuthorizationService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;
    private final AuthorizationService authorizationService;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingService bookingService,
            AuthorizationService authorizationService
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
        this.authorizationService = authorizationService;
    }

    public ResponseEntity<ApiResponse<PaymentDto>> getPayment(AuthenticatedActor actor, String paymentId) {
        authorizationService.require(actor, RolePermission.PAYMENT_VIEW);

        Optional<UUID> parsedPaymentId = parseUuid(paymentId);
        if (parsedPaymentId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Payment id must be a valid UUID."));
        }

        return paymentRepository.findById(parsedPaymentId.get())
                .map(payment -> ResponseEntity.ok(ApiResponse.ok(toDto(payment))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Payment was not found.")));
    }

    @Transactional
    public ResponseEntity<ApiResponse<PaymentDto>> createPayment(
            AuthenticatedActor actor,
            CreatePaymentRequest request
    ) {
        if (actor == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail("Sign in is required to pay."));
        }
        Optional<String> validationError = validate(request);
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        try {
            UUID userId = UUID.fromString(request.userId());
            UUID hostId = UUID.fromString(request.hostId());
            BookingEntity booking = resolveBooking(actor, request, userId, hostId);
            PaymentEntity payment = new PaymentEntity(
                    booking,
                    userId,
                    hostId,
                    request.currency().trim().toUpperCase(),
                    toMinorUnits(request.amount()),
                    actor.userId()
            );
            payment.setStatus(PaymentStatus.CAPTURED);
            PaymentEntity savedPayment = paymentRepository.save(payment);
            bookingService.confirmBooking(booking);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toDto(savedPayment)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(exception.getMessage()));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail(exception.getMessage()));
        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail("This rental was reserved by someone else for one or more selected dates."));
        }
    }

    private BookingEntity resolveBooking(
            AuthenticatedActor actor,
            CreatePaymentRequest request,
            UUID userId,
            UUID hostId
    ) {
        if (request.bookingId() != null && !request.bookingId().isBlank()) {
            UUID bookingId = UUID.fromString(request.bookingId());
            return bookingService.ensureReservedBooking(
                    actor,
                    bookingId,
                    request.listingId(),
                    hostId,
                    request.checkIn(),
                    request.checkOut()
            );
        }

        return bookingService.createReservedBookingForPayment(
                actor,
                userId,
                hostId,
                request.listingId(),
                request.checkIn(),
                request.checkOut()
        );
    }

    private Optional<String> validate(CreatePaymentRequest request) {
        if (request.userId() == null || request.userId().isBlank()) {
            return Optional.of("User id is required.");
        }
        if (request.hostId() == null || request.hostId().isBlank()) {
            return Optional.of("Host id is required.");
        }
        if (request.listingId() == null || request.listingId().isBlank()) {
            return Optional.of("Listing id is required.");
        }
        if (request.checkIn() == null) {
            return Optional.of("Check-in date is required.");
        }
        if (request.checkOut() == null) {
            return Optional.of("Check-out date is required.");
        }
        if (!request.checkOut().isAfter(request.checkIn())) {
            return Optional.of("Check-out date must be after check-in date.");
        }
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return Optional.of("Payment amount must be greater than zero.");
        }
        if (request.currency() == null || request.currency().isBlank()) {
            return Optional.of("Currency is required.");
        }
        return Optional.empty();
    }

    private Optional<UUID> parseUuid(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private Integer toMinorUnits(BigDecimal amount) {
        return amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    private PaymentDto toDto(PaymentEntity payment) {
        return new PaymentDto(
                payment.getId().toString(),
                payment.getBooking().getId().toString(),
                BigDecimal.valueOf(payment.getAmountMinor()).movePointLeft(2),
                payment.getCurrency(),
                payment.getStatus()
        );
    }
}
