package com.stayhaven.api_gateway.bookings.dto;

import com.stayhaven.api_gateway.bookings.types.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpcomingBookingDto(
        String id,
        String userId,
        String hostId,
        String hostName,
        String listingId,
        String listingName,
        BigDecimal pricePerNight,
        LocalDate checkIn,
        LocalDate checkOut,
        BookingStatus status
) {
}
