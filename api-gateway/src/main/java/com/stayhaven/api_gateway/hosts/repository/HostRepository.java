package com.stayhaven.api_gateway.hosts.repository;

import com.stayhaven.api_gateway.hosts.entity.HostEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HostRepository extends JpaRepository<HostEntity, UUID> {
    Optional<HostEntity> findByUserId(UUID userId);
}
