package com.stayhaven.api_gateway.rentals.dto;

import java.math.BigDecimal;

public record PublicRentalDto(
        String id,
        String hostId,
        String hostName,
        String name,
        String description,
        BigDecimal pricePerNight
) {
}
