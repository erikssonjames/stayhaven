package com.stayhaven.api_gateway.rentals.restcontroller;

import com.stayhaven.api_gateway.bookings.dto.BookingAvailabilityDto;
import com.stayhaven.api_gateway.bookings.service.BookingService;
import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.rentals.dto.PublicRentalDto;
import com.stayhaven.api_gateway.rentals.service.RentalService;
import java.time.LocalDate;
import java.util.List;
import org.jspecify.annotations.NonNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rentals")
public class PublicRentalController {
    private final RentalService rentalService;
    private final BookingService bookingService;

    public PublicRentalController(RentalService rentalService, BookingService bookingService) {
        this.rentalService = rentalService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<@NonNull ApiResponse<List<PublicRentalDto>>> getAvailableRentals() {
        return rentalService.getAvailableRentals();
    }

    @GetMapping("/{rentalId}/availability")
    public ResponseEntity<@NonNull ApiResponse<BookingAvailabilityDto>> getAvailability(
            @PathVariable String rentalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return bookingService.getAvailability(rentalId, checkIn, checkOut);
    }
}
