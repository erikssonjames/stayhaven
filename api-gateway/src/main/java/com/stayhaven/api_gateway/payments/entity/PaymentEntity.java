package com.stayhaven.api_gateway.payments.entity;

import com.stayhaven.api_gateway.bookings.entity.BookingEntity;
import com.stayhaven.api_gateway.payments.types.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private BookingEntity booking;

    @Column(name = "payer_id", nullable = false)
    private UUID payerId;

    @Column(name = "payee_id", nullable = false)
    private UUID payeeId;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "amount_minor", nullable = false)
    private Integer amountMinor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(length = 64)
    private String provider;

    @Column(name = "who_did_it", nullable = false)
    private UUID whoDidIt;

    @Column(name = "what_did_it", nullable = false, length = 32)
    private String whatDidIt;

    @Column(name = "when_did_it", nullable = false)
    private Instant whenDidIt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PaymentEntity() {
    }

    public PaymentEntity(
            BookingEntity booking,
            UUID payerId,
            UUID payeeId,
            String currency,
            Integer amountMinor,
            UUID whoDidIt
    ) {
        this.booking = booking;
        this.payerId = payerId;
        this.payeeId = payeeId;
        this.currency = currency;
        this.amountMinor = amountMinor;
        this.whoDidIt = whoDidIt;
        this.whatDidIt = "USER";
        this.provider = "stayhaven-demo";
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        whenDidIt = now;
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public BookingEntity getBooking() {
        return booking;
    }

    public Integer getAmountMinor() {
        return amountMinor;
    }

    public String getCurrency() {
        return currency;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
}
