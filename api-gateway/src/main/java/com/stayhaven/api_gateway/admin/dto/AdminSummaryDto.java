package com.stayhaven.api_gateway.admin.dto;

public record AdminSummaryDto(
        long userCount,
        long hostCount,
        long bookingCount,
        long paymentCount
) {
}
