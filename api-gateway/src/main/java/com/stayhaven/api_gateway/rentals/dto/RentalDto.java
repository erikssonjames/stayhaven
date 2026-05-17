package com.stayhaven.api_gateway.rentals.dto;

import java.math.BigDecimal;

public record RentalDto(
        String id,
        String hostId,
        String name,
        String description,
        BigDecimal pricePerNight
) {
}
