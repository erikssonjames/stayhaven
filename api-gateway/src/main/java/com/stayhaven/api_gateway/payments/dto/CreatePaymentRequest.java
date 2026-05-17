package com.stayhaven.api_gateway.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePaymentRequest(
        String bookingId,
        String userId,
        String hostId,
        String listingId,
        LocalDate checkIn,
        LocalDate checkOut,
        BigDecimal amount,
        String currency
) {
}
