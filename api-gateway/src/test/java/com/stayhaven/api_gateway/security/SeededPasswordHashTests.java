package com.stayhaven.api_gateway.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class SeededPasswordHashTests {
    @Test
    void seededPasswordHashMatchesDevelopmentPassword() {
        String hash = "$2a$10$UrgH7Brt/B4eq7ndds0opO1FkrVnJd9oaEghZ.2HLeT6BzwEDvVpS";

        assertThat(new BCryptPasswordEncoder().matches("password", hash)).isTrue();
    }
}
