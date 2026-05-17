package com.stayhaven.api_gateway.bookings.dto;

import com.stayhaven.api_gateway.bookings.types.BookingStatus;
import java.time.LocalDate;

public record BookingDto(
        String id,
        String userId,
        String hostId,
        String listingId,
        LocalDate checkIn,
        LocalDate checkOut,
        BookingStatus status
) {
}
