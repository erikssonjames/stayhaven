package com.stayhaven.payment_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitPaymentConfig {
    public static final String PAYMENT_EVENTS_QUEUE = "stayhaven.payment.events";
    public static final String PAYMENT_EVENTS_DLQ = "stayhaven.payment.events.dlq";
    public static final String PAYMENT_DLX = "stayhaven.payment.dlx";

    @Bean
    public DirectExchange paymentDeadLetterExchange() {
        return new DirectExchange(PAYMENT_DLX);
    }

    @Bean
    public Queue paymentEventsQueue() {
        return QueueBuilder
            .durable(PAYMENT_EVENTS_QUEUE)
            .deadLetterExchange(PAYMENT_DLX)
            .deadLetterRoutingKey("payment.failed")
            .build();
    }

    @Bean
    public Queue paymentEventsDlq() {
        return QueueBuilder
            .durable(PAYMENT_EVENTS_DLQ)
            .build();
    }

    @Bean
    public Binding paymentEventsDlqBinding() {
        return BindingBuilder
            .bind(paymentEventsDlq())
            .to(paymentDeadLetterExchange())
            .with("payment.failed");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
