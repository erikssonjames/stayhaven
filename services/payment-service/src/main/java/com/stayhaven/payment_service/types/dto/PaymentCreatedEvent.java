package com.stayhaven.payment_service.types.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentCreatedEvent (
   UUID paymentId,
   UUID bookingId,
   UUID userId,
   BigDecimal amount,
   String currency,
   String status,
   Instant createdAt
) {
}
