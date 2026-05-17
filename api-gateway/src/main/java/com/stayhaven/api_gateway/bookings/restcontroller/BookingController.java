package com.stayhaven.api_gateway.bookings.restcontroller;

import com.stayhaven.api_gateway.bookings.dto.BookingDto;
import com.stayhaven.api_gateway.bookings.dto.BookingReservationStatusDto;
import com.stayhaven.api_gateway.bookings.dto.CreateBookingRequest;
import com.stayhaven.api_gateway.bookings.dto.UpcomingBookingDto;
import com.stayhaven.api_gateway.bookings.service.BookingService;
import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import java.time.LocalDate;
import java.util.List;
import org.jspecify.annotations.NonNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/upcoming")
    public ResponseEntity<@NonNull ApiResponse<List<UpcomingBookingDto>>> getUpcomingBookings(
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return bookingService.getUpcomingBookings(actor);
    }

    @GetMapping("/{bookingId:[0-9a-fA-F-]{36}}")
    public ResponseEntity<@NonNull ApiResponse<BookingDto>> getBooking(
            @PathVariable String bookingId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return bookingService.getBooking(actor, bookingId);
    }

    @PostMapping
    public ResponseEntity<@NonNull ApiResponse<BookingDto>> createBooking(
            @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return bookingService.createBooking(actor, request);
    }

    @GetMapping("/reservation-status")
    public ResponseEntity<@NonNull ApiResponse<BookingReservationStatusDto>> checkReservationAvailability(
            @RequestParam String listingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) String bookingId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return bookingService.checkReservationAvailability(actor, listingId, checkIn, checkOut, bookingId);
    }
}
