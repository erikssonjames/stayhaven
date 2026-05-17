package com.stayhaven.api_gateway.bookings.repository;

import com.stayhaven.api_gateway.bookings.entity.BookingEntity;
import com.stayhaven.api_gateway.bookings.types.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<BookingEntity, UUID> {
    List<BookingEntity> findByHostId(UUID hostId);

    List<BookingEntity> findByUserId(UUID userId);

    @Query("""
            select booking
            from BookingEntity booking
            join fetch booking.host
            where booking.user.id = :userId
                and booking.checkOutDate >= :checkOutDate
                and booking.status in :statuses
            order by booking.checkInDate asc
            """)
    List<BookingEntity> findUpcomingByUserId(
            @Param("userId") UUID userId,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("statuses") List<BookingStatus> statuses
    );

    Optional<BookingEntity> findFirstByListingIdAndUserIdAndCheckInDateAndCheckOutDateAndStatusIn(
            String listingId,
            UUID userId,
            LocalDate checkIn,
            LocalDate checkOut,
            List<BookingStatus> statuses
    );

    @Query("""
            select booking
            from BookingEntity booking
            where booking.listingId = :listingId
                and booking.status in :statuses
                and booking.checkInDate < :checkOut
                and booking.checkOutDate > :checkIn
            """)
    List<BookingEntity> findOverlappingActiveBookings(
            @Param("listingId") String listingId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<BookingStatus> statuses
    );

    @Modifying
    @Query("""
            delete from BookingEntity booking
            where booking.status = :status
                and booking.updatedAt < :cutoff
            """)
    int deleteByStatusAndUpdatedAtBefore(
            @Param("status") BookingStatus status,
            @Param("cutoff") Instant cutoff
    );
}
