package com.stayhaven.api_gateway.payments.dto;

import com.stayhaven.api_gateway.payments.types.PaymentStatus;
import java.math.BigDecimal;

public record PaymentDto(
        String id,
        String bookingId,
        BigDecimal amount,
        String currency,
        PaymentStatus status
) {
}
