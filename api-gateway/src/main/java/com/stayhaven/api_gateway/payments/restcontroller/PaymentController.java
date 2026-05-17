package com.stayhaven.api_gateway.payments.restcontroller;

import com.stayhaven.api_gateway.common.ApiResponse;
import com.stayhaven.api_gateway.payments.dto.CreatePaymentRequest;
import com.stayhaven.api_gateway.payments.dto.PaymentDto;
import com.stayhaven.api_gateway.payments.service.PaymentService;
import com.stayhaven.api_gateway.security.AuthenticatedActor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<@NonNull ApiResponse<PaymentDto>> getPayment(
            @PathVariable String paymentId,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return paymentService.getPayment(actor, paymentId);
    }

    @PostMapping
    public ResponseEntity<@NonNull ApiResponse<PaymentDto>> createPayment(
            @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal AuthenticatedActor actor
    ) {
        return paymentService.createPayment(actor, request);
    }
}
