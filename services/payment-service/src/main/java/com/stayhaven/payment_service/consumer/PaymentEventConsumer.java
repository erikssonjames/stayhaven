package com.stayhaven.payment_service.consumer;

import com.stayhaven.payment_service.config.RabbitPaymentConfig;
import com.stayhaven.payment_service.types.dto.PaymentCreatedEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventConsumer {
    @RabbitListener(queues = RabbitPaymentConfig.PAYMENT_EVENTS_QUEUE)
    public void handlePaymentCreated(PaymentCreatedEvent event) {
        System.out.println("Received payment created event: " + event);
    }
}
