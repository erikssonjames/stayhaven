package com.stayhaven.api_gateway.bookings.dto;

import java.time.LocalDate;
import java.util.List;

public record BookingAvailabilityDto(
        String listingId,
        LocalDate checkIn,
        LocalDate checkOut,
        List<LocalDate> blockedDates
) {
}
