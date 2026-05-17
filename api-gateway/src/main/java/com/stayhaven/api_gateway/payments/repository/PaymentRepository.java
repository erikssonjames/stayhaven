package com.stayhaven.api_gateway.payments.repository;

import com.stayhaven.api_gateway.payments.entity.PaymentEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {
}
