package com.stayhaven.api_gateway.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();

    private final byte[] secret;
    private final Duration ttl;
    private final Clock clock;

    public AuthTokenService(
            @Value("${stayhaven.auth.token-secret:local-development-token-secret-change-me}") String secret,
            @Value("${stayhaven.auth.token-ttl-hours:12}") long ttlHours
    ) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttl = Duration.ofHours(ttlHours);
        this.clock = Clock.systemUTC();
    }

    public String issueToken(UUID userId) {
        long expiresAt = Instant.now(clock).plus(ttl).getEpochSecond();
        String payload = userId + ":" + expiresAt;
        String encodedPayload = BASE64_URL_ENCODER.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String encodedSignature = BASE64_URL_ENCODER.encodeToString(sign(encodedPayload));
        return encodedPayload + "." + encodedSignature;
    }

    public Optional<UUID> validateToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        String[] parts = token.split("\\.", -1);
        if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
            return Optional.empty();
        }

        byte[] expectedSignature = sign(parts[0]);
        byte[] actualSignature;
        try {
            actualSignature = BASE64_URL_DECODER.decode(parts[1]);
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }

        if (!MessageDigest.isEqual(expectedSignature, actualSignature)) {
            return Optional.empty();
        }

        String payload;
        try {
            payload = new String(BASE64_URL_DECODER.decode(parts[0]), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }

        String[] payloadParts = payload.split(":", -1);
        if (payloadParts.length != 2) {
            return Optional.empty();
        }

        try {
            long expiresAt = Long.parseLong(payloadParts[1]);
            if (Instant.now(clock).getEpochSecond() >= expiresAt) {
                return Optional.empty();
            }
            return Optional.of(UUID.fromString(payloadParts[0]));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private byte[] sign(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign authentication token.", exception);
        }
    }
}
