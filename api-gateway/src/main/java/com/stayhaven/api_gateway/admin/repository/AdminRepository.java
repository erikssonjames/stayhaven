package com.stayhaven.api_gateway.admin.repository;

import com.stayhaven.api_gateway.admin.entity.AdminEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<AdminEntity, UUID> {
    Optional<AdminEntity> findByUserId(UUID userId);
}
