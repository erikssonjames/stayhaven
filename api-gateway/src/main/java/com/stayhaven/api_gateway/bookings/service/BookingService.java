package com.stayhaven.api_gateway.bookings.service;

import com.stayhaven.api_gateway.bookings.dto.BookingDto;
import com.stayhaven.api_gateway.bookings.dto.BookingAvailabilityDto;
import com.stayhaven.api_gateway.bookings.dto.BookingReservationStatusDto;
import com.stayhaven.api_gateway.bookings.dto.CreateBookingRequest;
import com.stayhaven.api_gateway.bookings.dto.UpcomingBookingDto;
import com.stayhaven.api_gateway.bookings.entity.BookingEntity;
import com.stayhaven.api_gateway.bookings.repository.BookingRepository;
import com.stayhaven.api_gateway.bookings.types.BookingStatus;
import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.hosts.entity.HostEntity;
import com.stayhaven.api_gateway.hosts.repository.HostRepository;
import com.stayhaven.api_gateway.rentals.entity.RentalEntity;
import com.stayhaven.api_gateway.rentals.repository.RentalRepository;
import com.stayhaven.api_gateway.roles.service.RolePolicy;
import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import com.stayhaven.api_gateway.security.AuthorizationService;
import com.stayhaven.api_gateway.users.entity.UserEntity;
import com.stayhaven.api_gateway.users.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
    private final AuthorizationService authorizationService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final HostRepository hostRepository;
    private final RentalRepository rentalRepository;

    public BookingService(
            AuthorizationService authorizationService,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            HostRepository hostRepository,
            RentalRepository rentalRepository
    ) {
        this.authorizationService = authorizationService;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.hostRepository = hostRepository;
        this.rentalRepository = rentalRepository;
    }

    public ResponseEntity<@NonNull ApiResponse<BookingDto>> getBooking(AuthenticatedActor actor, String bookingId) {
        Optional<UUID> parsedBookingId = parseUuid(bookingId);
        if (parsedBookingId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Booking id must be a valid UUID."));
        }

        Optional<BookingEntity> booking = bookingRepository.findById(parsedBookingId.get());
        if (booking.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Booking was not found."));
        }

        BookingEntity existingBooking = booking.get();
        requireBookingViewPermission(actor, existingBooking);

        return ResponseEntity.ok(ApiResponse.ok(toDto(existingBooking)));
    }

    public void cancelBooking(AuthenticatedActor actor, String bookingId) {
        Optional<UUID> parsedBookingId = parseUuid(bookingId);
        if (parsedBookingId.isEmpty()) {
            throw new IllegalArgumentException("Booking id must be a valid UUID.");
        }
        BookingEntity booking = bookingRepository.findByIdAndStatusEquals(parsedBookingId.get(), BookingStatus.CONFIRMED)
                .orElseThrow(() -> new IllegalArgumentException("Booking was not found."));
        authorizationService.requireSelfOrPermission(
                actor,
                booking.getUser().getId(),
                RolePermission.BOOKING_MANAGE_OWN,
                RolePermission.BOOKING_MANAGE_ALL
        );
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking);
    }

    public void deleteBooking(AuthenticatedActor actor, String bookingId) {
        Optional<UUID> parsedBookingId = parseUuid(bookingId);
        if (parsedBookingId.isEmpty()) {
            throw new IllegalArgumentException("Booking id must be a valid UUID.");
        }
        BookingEntity booking = bookingRepository.findById(parsedBookingId.get())
            .orElseThrow(() -> new IllegalArgumentException("Booking was not found."));
        authorizationService.require(
            actor,
            RolePermission.BOOKING_MANAGE_ALL
        );
        bookingRepository.delete(booking);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<@NonNull ApiResponse<List<UpcomingBookingDto>>> getUpcomingBookings(AuthenticatedActor actor) {
        LocalDate today = LocalDate.now();
        List<BookingStatus> statuses = activeBookingStatuses();

        List<BookingEntity> upcomingBookings;
        if (actor != null
                && actor.hostId() != null
                && RolePolicy.hasPermission(actor.role(), RolePermission.RENTAL_MANAGE_OWN)) {
            authorizationService.requireOwnHostOrPermission(
                    actor,
                    actor.hostId(),
                    RolePermission.RENTAL_MANAGE_OWN,
                    RolePermission.BOOKING_MANAGE_ALL
            );
            upcomingBookings = bookingRepository.findUpcomingByHostId(actor.hostId(), today, statuses);
        } else {
            authorizationService.require(actor, RolePermission.BOOKING_MANAGE_OWN);
            upcomingBookings = bookingRepository.findUpcomingByUserId(actor.userId(), today, statuses);
        }

        List<UpcomingBookingDto> bookings = upcomingBookings
                .stream()
                .map(this::toUpcomingDto)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    public ResponseEntity<@NonNull ApiResponse<BookingAvailabilityDto>> getAvailability(
            String listingId,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        Optional<String> validationError = validate(listingId, checkIn, checkOut);
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        List<BookingStatus> activeStatuses = activeBookingStatuses();
        List<LocalDate> blockedDates = bookingRepository.findOverlappingActiveBookings(
                        listingId.trim(),
                        checkIn,
                        checkOut,
                        activeStatuses
                )
                .stream()
                .flatMap(booking -> blockedDatesFor(booking, checkIn, checkOut).stream())
                .distinct()
                .sorted()
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(new BookingAvailabilityDto(
                listingId.trim(),
                checkIn,
                checkOut,
                blockedDates
        )));
    }

    @Transactional
    public ResponseEntity<@NonNull ApiResponse<BookingDto>> createBooking(
            AuthenticatedActor actor,
            CreateBookingRequest request
    ) {
        Optional<UUID> parsedUserId = parseUuid(request.userId());
        Optional<UUID> parsedHostId = parseUuid(request.hostId());
        if (parsedUserId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("User id must be a valid UUID."));
        }
        if (parsedHostId.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Host id must be a valid UUID."));
        }

        authorizationService.requireSelfOrPermission(
                actor,
                parsedUserId.get(),
                RolePermission.BOOKING_CREATE_OWN,
                RolePermission.BOOKING_MANAGE_ALL
        );

        Optional<String> validationError = validate(request.listingId(), request.checkIn(), request.checkOut());
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        Optional<UserEntity> user = userRepository.findById(parsedUserId.get());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("User was not found."));
        }

        Optional<HostEntity> host = hostRepository.findById(parsedHostId.get());
        if (host.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Host was not found."));
        }

        Optional<BookingEntity> existingUserReservation = bookingRepository
                .findFirstByListingIdAndUserIdAndCheckInDateAndCheckOutDateAndStatusIn(
                        request.listingId().trim(),
                        parsedUserId.get(),
                        request.checkIn(),
                        request.checkOut(),
                        List.of(BookingStatus.RESERVED, BookingStatus.CONFIRMED)
                );
        if (existingUserReservation.isPresent()) {
            return ResponseEntity.ok(ApiResponse.ok(toDto(existingUserReservation.get())));
        }

        terminateOverlappingReservedBookings(
                request.listingId().trim(),
                parsedUserId.get(),
                request.checkIn(),
                request.checkOut(),
                Optional.empty()
        );

        Optional<BookingEntity> overlappingBooking = findConflictingBooking(
                request.listingId().trim(),
                request.checkIn(),
                request.checkOut(),
                Optional.empty(),
                Optional.of(parsedUserId.get())
        );
        if (overlappingBooking.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail("This rental is already reserved for one or more selected dates."));
        }

        BookingEntity booking = new BookingEntity(
                user.get(),
                host.get(),
                request.listingId().trim(),
                request.checkIn(),
                request.checkOut()
        );
        booking.setStatus(BookingStatus.RESERVED);

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toDto(bookingRepository.saveAndFlush(booking))));
        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail("This rental is already reserved for one or more selected dates."));
        }
    }

    public ResponseEntity<@NonNull ApiResponse<BookingReservationStatusDto>> checkReservationAvailability(
            AuthenticatedActor actor,
            String listingId,
            LocalDate checkIn,
            LocalDate checkOut,
            String bookingId
    ) {
        Optional<String> validationError = validate(listingId, checkIn, checkOut);
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(validationError.get()));
        }

        Optional<UUID> parsedBookingId = Optional.empty();
        UUID actorUserId = actor.userId();
        if (bookingId != null && !bookingId.isBlank()) {
            parsedBookingId = parseUuid(bookingId);
            if (parsedBookingId.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.fail("Booking id must be a valid UUID."));
            }

            Optional<BookingEntity> booking = bookingRepository.findById(parsedBookingId.get());
            if (booking.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Booking was not found."));
            }

            BookingEntity existingBooking = booking.get();
            actorUserId = existingBooking.getUser().getId();
            authorizationService.requireSelfOrPermission(
                    actor,
                    existingBooking.getUser().getId(),
                    RolePermission.BOOKING_MANAGE_OWN,
                    RolePermission.BOOKING_MANAGE_ALL
            );
            if (!existingBooking.getListingId().equals(listingId.trim())
                    || !existingBooking.getCheckInDate().equals(checkIn)
                    || !existingBooking.getCheckOutDate().equals(checkOut)) {
                return ResponseEntity.badRequest().body(ApiResponse.fail("Booking dates do not match this checkout."));
            }
        }

        terminateOverlappingReservedBookings(
                listingId.trim(),
                actor.userId(),
                checkIn,
                checkOut,
                parsedBookingId
        );

        Optional<BookingEntity> conflictingBooking = findConflictingBooking(
                listingId.trim(),
                checkIn,
                checkOut,
                parsedBookingId,
                Optional.of(actorUserId)
        );
        if (conflictingBooking.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail("This rental was reserved by someone else for one or more selected dates."));
        }

        return ResponseEntity.ok(ApiResponse.ok(new BookingReservationStatusDto(true, null)));
    }

    @Transactional
    public BookingEntity ensureReservedBooking(
            AuthenticatedActor actor,
            UUID bookingId,
            String listingId,
            UUID hostId,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking was not found."));
        authorizationService.requireSelfOrPermission(
                actor,
                booking.getUser().getId(),
                RolePermission.BOOKING_MANAGE_OWN,
                RolePermission.BOOKING_MANAGE_ALL
        );
        if (!booking.getListingId().equals(listingId.trim())
                || !booking.getHost().getId().equals(hostId)
                || !booking.getCheckInDate().equals(checkIn)
                || !booking.getCheckOutDate().equals(checkOut)) {
            throw new IllegalArgumentException("Booking details do not match this payment request.");
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return booking;
        }
        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new IllegalStateException("Booking must be reserved before payment.");
        }
        findConflictingBooking(listingId.trim(), checkIn, checkOut, Optional.of(booking.getId()), Optional.of(booking.getUser().getId()))
                .ifPresent(conflict -> {
                    throw new IllegalStateException("This rental was reserved by someone else for one or more selected dates.");
                });

        return booking;
    }

    @Transactional
    public BookingEntity createReservedBookingForPayment(
            AuthenticatedActor actor,
            UUID userId,
            UUID hostId,
            String listingId,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        authorizationService.requireSelfOrPermission(
                actor,
                userId,
                RolePermission.BOOKING_CREATE_OWN,
                RolePermission.BOOKING_MANAGE_ALL
        );
        Optional<BookingEntity> existingUserReservation = bookingRepository
                .findFirstByListingIdAndUserIdAndCheckInDateAndCheckOutDateAndStatusIn(
                        listingId.trim(),
                        userId,
                        checkIn,
                        checkOut,
                        List.of(BookingStatus.RESERVED, BookingStatus.CONFIRMED)
                );
        if (existingUserReservation.isPresent()) {
            return existingUserReservation.get();
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User was not found."));
        HostEntity host = hostRepository.findById(hostId)
                .orElseThrow(() -> new IllegalArgumentException("Host was not found."));
        terminateOverlappingReservedBookings(listingId.trim(), userId, checkIn, checkOut, Optional.empty());

        findConflictingBooking(listingId.trim(), checkIn, checkOut, Optional.empty(), Optional.of(userId))
                .ifPresent(conflict -> {
                    throw new IllegalStateException("This rental was reserved by someone else for one or more selected dates.");
                });

        BookingEntity booking = new BookingEntity(user, host, listingId.trim(), checkIn, checkOut);
        booking.setStatus(BookingStatus.RESERVED);

        try {
            return bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("This rental was reserved by someone else for one or more selected dates.");
        }
    }

    public void confirmBooking(BookingEntity booking) {
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking);
    }

    private Optional<UUID> parseUuid(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private Optional<String> validate(String listingId, LocalDate checkIn, LocalDate checkOut) {
        if (listingId == null || listingId.isBlank()) {
            return Optional.of("Listing id is required.");
        }
        if (checkIn == null) {
            return Optional.of("Check-in date is required.");
        }
        if (checkOut == null) {
            return Optional.of("Check-out date is required.");
        }
        if (!checkOut.isAfter(checkIn)) {
            return Optional.of("Check-out date must be after check-in date.");
        }
        return Optional.empty();
    }

    private Optional<BookingEntity> findConflictingBooking(
            String listingId,
            LocalDate checkIn,
            LocalDate checkOut,
            Optional<UUID> allowedBookingId,
            Optional<UUID> ignoredUserId
    ) {
        return bookingRepository.findOverlappingActiveBookings(listingId, checkIn, checkOut, activeBookingStatuses())
                .stream()
                .filter(booking -> allowedBookingId.map(id -> !booking.getId().equals(id)).orElse(true))
                .filter(booking -> ignoredUserId.map(userId -> !booking.getUser().getId().equals(userId)).orElse(true))
                .findFirst();
    }

    private void terminateOverlappingReservedBookings(
            String listingId,
            UUID userId,
            LocalDate checkIn,
            LocalDate checkOut,
            Optional<UUID> allowedBookingId
    ) {
        List<BookingEntity> overlappingBookings = bookingRepository
                .findOverlappingActiveBookings(listingId, checkIn, checkOut, activeBookingStatuses())
                .stream()
                .filter(booking -> booking.getUser().getId().equals(userId))
                .filter(booking -> booking.getStatus() == BookingStatus.RESERVED)
                .filter(booking -> allowedBookingId.map(id -> !booking.getId().equals(id)).orElse(true))
                .toList();

        overlappingBookings.forEach(booking -> booking.setStatus(BookingStatus.CANCELLED));
        if (!overlappingBookings.isEmpty()) {
            bookingRepository.saveAll(overlappingBookings);
        }
    }

    private List<BookingStatus> activeBookingStatuses() {
        return List.of(BookingStatus.RESERVED, BookingStatus.REQUESTED, BookingStatus.CONFIRMED);
    }

    private List<LocalDate> blockedDatesFor(BookingEntity booking, LocalDate requestedCheckIn, LocalDate requestedCheckOut) {
        LocalDate blockedStart = booking.getCheckInDate().isAfter(requestedCheckIn)
                ? booking.getCheckInDate()
                : requestedCheckIn;
        LocalDate blockedEnd = booking.getCheckOutDate().isBefore(requestedCheckOut)
                ? booking.getCheckOutDate()
                : requestedCheckOut;
        List<LocalDate> dates = new ArrayList<>();

        for (LocalDate date = blockedStart; date.isBefore(blockedEnd); date = date.plusDays(1)) {
            dates.add(date);
        }

        return dates;
    }

    private BookingDto toDto(BookingEntity booking) {
        return new BookingDto(
                booking.getId().toString(),
                booking.getUser().getId().toString(),
                booking.getHost().getId().toString(),
                booking.getListingId(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getStatus()
        );
    }

    private void requireBookingViewPermission(AuthenticatedActor actor, BookingEntity booking) {
        if (actor != null
                && actor.userId().equals(booking.getUser().getId())
                && RolePolicy.hasPermission(actor.role(), RolePermission.BOOKING_MANAGE_OWN)) {
            return;
        }

        if (actor != null
                && actor.hostId() != null
                && actor.hostId().equals(booking.getHost().getId())
                && RolePolicy.hasPermission(actor.role(), RolePermission.RENTAL_MANAGE_OWN)) {
            return;
        }

        authorizationService.require(actor, RolePermission.BOOKING_MANAGE_ALL);
    }

    private UpcomingBookingDto toUpcomingDto(BookingEntity booking) {
        Optional<RentalEntity> rental = parseUuid(booking.getListingId()).flatMap(rentalRepository::findById);

        return new UpcomingBookingDto(
                booking.getId().toString(),
                booking.getUser().getId().toString(),
                booking.getHost().getId().toString(),
                booking.getHost().getDisplayName(),
                booking.getListingId(),
                rental.map(RentalEntity::getName).orElse("Stayhaven rental"),
                rental.map(RentalEntity::getPricePerNight).orElse(BigDecimal.ZERO),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getStatus()
        );
    }
}
