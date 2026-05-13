package com.nihongo.platform.controller;

import com.nihongo.platform.entity.Session;
import com.nihongo.platform.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class ZoomWebhookController {

    private final SessionRepository sessionRepository;

    @Value("${app.zoom.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/zoom")
    public ResponseEntity<?> handleZoomWebhook(
            @RequestHeader(value = "x-zm-signature", required = false) String signature,
            @RequestHeader(value = "x-zm-request-timestamp", required = false) String timestamp,
            @RequestBody Map<String, Object> payload) {

        String event = (String) payload.get("event");
        log.info("Zoom webhook received: {}", event);

        // Zoom endpoint validation challenge
        if ("endpoint.url_validation".equals(event)) {
            Map<?, ?> payload2 = (Map<?, ?>) payload.get("payload");
            String token = (String) payload2.get("plainToken");
            try {
                Mac mac = Mac.getInstance("HmacSHA256");
                mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
                String hash = HexFormat.of().formatHex(mac.doFinal(token.getBytes(StandardCharsets.UTF_8)));
                return ResponseEntity.ok(Map.of("plainToken", token, "encryptedToken", hash));
            } catch (Exception e) {
                return ResponseEntity.ok(Map.of("plainToken", token, "encryptedToken", token));
            }
        }

        if ("meeting.ended".equals(event)) {
            Map<?, ?> meetingPayload = (Map<?, ?>) ((Map<?, ?>) payload.get("payload")).get("object");
            String meetingId = meetingPayload.get("id").toString();
            sessionRepository.findByZoomMeetingId(meetingId).ifPresent(s -> {
                s.setActive(false);
                s.setEnded(true);
                sessionRepository.save(s);
                log.info("Session '{}' marked as ENDED via Zoom webhook", s.getTitle());
            });
        }

        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
