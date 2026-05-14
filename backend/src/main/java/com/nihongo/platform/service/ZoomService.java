package com.nihongo.platform.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
public class ZoomService {

    public record ZoomMeetingInfo(
            String meetingId,
            String joinUrl,
            String startUrl,
            String passcode
    ) {}

    @Value("${app.zoom.account-id}")
    private String accountId;

    @Value("${app.zoom.client-id}")
    private String clientId;

    @Value("${app.zoom.client-secret}")
    private String clientSecret;

    @Value("${app.zoom.api-base-url}")
    private String apiBaseUrl;

    @Value("${app.zoom.token-url}")
    private String tokenUrl;

    private final WebClient webClient = WebClient.builder().build();

    // ── Token ───────────────────────────────────────────────────────────────

    private boolean isConfigured() {
        return accountId   != null && !accountId.isBlank()   && !accountId.startsWith("your-")
            && clientId    != null && !clientId.isBlank()    && !clientId.startsWith("your-")
            && clientSecret != null && !clientSecret.isBlank() && !clientSecret.startsWith("your-");
    }

    private String getAccessToken() {
        if (!isConfigured()) {
            log.warn("⚠️  Zoom credentials not configured — using mock data");
            return "MOCK_TOKEN";
        }

        // Base64-encode "clientId:clientSecret" for HTTP Basic auth
        String credentials = Base64.getEncoder()
                .encodeToString((clientId + ":" + clientSecret).getBytes());

        try {
            // Zoom Server-to-Server OAuth:
            // grant_type and account_id MUST be in the FORM BODY, not query params
            Map<?, ?> response = webClient.post()
                    .uri(tokenUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + credentials)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData("grant_type", "account_credentials")
                            .with("account_id", accountId))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("access_token")) {
                log.error("Zoom token response missing access_token: {}", response);
                throw new RuntimeException("Failed to obtain Zoom access token");
            }

            log.info("✅ Zoom access token obtained successfully");
            return (String) response.get("access_token");

        } catch (Exception e) {
            log.error("❌ Zoom token request failed: {} — falling back to mock", e.getMessage());
            // Graceful fallback during development so session creation still works
            return "MOCK_TOKEN";
        }
    }

    // ── Create Meeting ───────────────────────────────────────────────────────

    public ZoomMeetingInfo createMeeting(String topic, LocalDateTime startTime, Integer duration) {
        String token = getAccessToken();

        if ("MOCK_TOKEN".equals(token)) {
            return mockMeeting(topic);
        }

        try {
            // Convert LocalDateTime → UTC instant string (e.g. "2026-05-14T07:30:00Z")
            // The literal 'Z' suffix without conversion was causing Zoom 400 errors
            String startTimeUtc = startTime
                    .toInstant(ZoneOffset.UTC)
                    .toString()                          // produces "2026-05-14T07:30:00Z"
                    .replaceAll("\\.\\d+Z$", "Z");       // strip millis if present

            int durationMins = (duration != null && duration > 0) ? duration : 60;

            Map<String, Object> body = Map.of(
                    "topic",      topic,
                    "type",       2,            // 2 = Scheduled meeting
                    "start_time", startTimeUtc,
                    "duration",   durationMins,
                    "timezone",   "UTC",
                    "settings", Map.of(
                            "host_video",        true,
                            "participant_video",  true,
                            "join_before_host",   false,
                            "waiting_room",       true,
                            "auto_recording",     "none"
                    )
            );

            Map<?, ?> response = webClient.post()
                    .uri(apiBaseUrl + "/users/me/meetings")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(body))
                    .retrieve()
                    // Log Zoom's actual error body so we can diagnose future failures
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("❌ Zoom meetings API error {}: {}",
                                        clientResponse.statusCode(), errorBody);
                                return Mono.error(new RuntimeException(
                                        "Zoom API " + clientResponse.statusCode() + ": " + errorBody));
                            })
                    )
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) throw new RuntimeException("Zoom API returned null response");

            log.info("✅ Zoom meeting created: id={}, topic={}", response.get("id"), topic);
            return new ZoomMeetingInfo(
                    response.get("id").toString(),
                    (String) response.get("join_url"),
                    (String) response.get("start_url"),
                    (String) response.get("password")
            );

        } catch (Exception e) {
            log.error("❌ Zoom createMeeting failed: {} — falling back to mock", e.getMessage());
            return mockMeeting(topic);
        }
    }

    private ZoomMeetingInfo mockMeeting(String topic) {
        String fakeId = "MOCK_" + System.currentTimeMillis();
        log.warn("📋 Using mock Zoom meeting for topic: '{}' (real Zoom unavailable)", topic);
        return new ZoomMeetingInfo(
                fakeId,
                "https://zoom.us/j/" + fakeId,
                "https://zoom.us/s/" + fakeId,
                "mock123"
        );
    }

    // ── Delete Meeting ───────────────────────────────────────────────────────

    public void deleteMeeting(String meetingId) {
        if (meetingId == null || meetingId.startsWith("MOCK_")) return;
        String token = getAccessToken();
        if ("MOCK_TOKEN".equals(token)) return;

        webClient.delete()
                .uri(apiBaseUrl + "/meetings/" + meetingId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .toBodilessEntity()
                .block();
        log.info("Zoom meeting {} deleted", meetingId);
    }
}
