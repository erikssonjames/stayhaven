package com.stayhaven.api_gateway.bookings.dto;

public record BookingReservationStatusDto(
        boolean available,
        String message
) {
}
