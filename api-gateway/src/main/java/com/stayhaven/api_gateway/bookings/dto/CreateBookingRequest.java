package com.stayhaven.api_gateway.bookings.dto;

import java.time.LocalDate;

public record CreateBookingRequest(
        String userId,
        String hostId,
        String listingId,
        LocalDate checkIn,
        LocalDate checkOut
) {
}
