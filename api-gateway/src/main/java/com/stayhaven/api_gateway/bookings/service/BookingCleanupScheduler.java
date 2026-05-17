package com.stayhaven.api_gateway.bookings.service;

import com.stayhaven.api_gateway.bookings.repository.BookingRepository;
import com.stayhaven.api_gateway.bookings.types.BookingStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingCleanupScheduler {
    private static final Logger LOGGER = LoggerFactory.getLogger(BookingCleanupScheduler.class);
    private static final Duration RESERVED_BOOKING_TTL = Duration.ofMinutes(20);

    private final BookingRepository bookingRepository;
    private final Clock clock;

    @Autowired
    public BookingCleanupScheduler(BookingRepository bookingRepository) {
        this(bookingRepository, Clock.systemUTC());
    }

    BookingCleanupScheduler(BookingRepository bookingRepository, Clock clock) {
        this.bookingRepository = bookingRepository;
        this.clock = clock;
    }

    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void removeStaleReservedBookings() {
        Instant cutoff = Instant.now(clock).minus(RESERVED_BOOKING_TTL);
        int deletedBookings = bookingRepository.deleteByStatusAndUpdatedAtBefore(BookingStatus.RESERVED, cutoff);
        if (deletedBookings > 0) {
            LOGGER.info("Deleted {} stale reserved booking(s).", deletedBookings);
        }
    }
}
