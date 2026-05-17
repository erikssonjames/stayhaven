package com.stayhaven.api_gateway.users.repository;

import com.stayhaven.api_gateway.users.entity.UserSettingsEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingsRepository extends JpaRepository<UserSettingsEntity, UUID> {
    Optional<UserSettingsEntity> findByUserId(UUID userId);
}
