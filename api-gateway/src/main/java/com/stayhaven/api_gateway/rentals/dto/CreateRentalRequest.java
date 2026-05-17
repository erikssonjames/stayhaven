package com.stayhaven.api_gateway.rentals.dto;

import java.math.BigDecimal;

public record CreateRentalRequest(
        String name,
        String description,
        BigDecimal pricePerNight
) {
}
