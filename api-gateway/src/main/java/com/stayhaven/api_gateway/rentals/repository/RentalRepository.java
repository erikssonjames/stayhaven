package com.stayhaven.api_gateway.rentals.repository;

import com.stayhaven.api_gateway.hosts.types.HostStatus;
import com.stayhaven.api_gateway.rentals.entity.RentalEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalRepository extends JpaRepository<RentalEntity, UUID> {
    List<RentalEntity> findByHostStatusOrderByCreatedAtDesc(HostStatus status);

    List<RentalEntity> findByHostId(UUID hostId);

    Optional<RentalEntity> findByIdAndHostId(UUID rentalId, UUID hostId);
}
