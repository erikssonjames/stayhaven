package com.stayhaven.api_gateway.users.repository;

import com.stayhaven.api_gateway.users.entity.UserEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    @EntityGraph(attributePaths = "role")
    Optional<UserEntity> findByEmail(String email);

    @EntityGraph(attributePaths = "role")
    Optional<UserEntity> findWithRoleById(UUID id);
}
