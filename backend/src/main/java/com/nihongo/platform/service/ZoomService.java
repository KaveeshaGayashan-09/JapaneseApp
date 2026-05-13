package com.nihongo.platform.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getAccessToken() {
        String credentials = Base64.getEncoder()
                .encodeToString((clientId + ":" + clientSecret).getBytes());

        // Detect mock credentials and skip real API call
        if (accountId.startsWith("your-") || accountId.isBlank()) {
            log.warn("⚠️  Zoom credentials not configured — using mock data");
            return "MOCK_TOKEN";
        }

        Map<?, ?> response = webClient.post()
                .uri(tokenUrl + "?grant_type=account_credentials&account_id=" + accountId)
                .header(HttpHeaders.AUTHORIZATION, "Basic " + credentials)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("access_token")) {
            throw new RuntimeException("Failed to obtain Zoom access token");
        }
        return (String) response.get("access_token");
    }

    public ZoomMeetingInfo createMeeting(String topic, LocalDateTime startTime, Integer duration) {
        String token = getAccessToken();

        // Mock mode
        if ("MOCK_TOKEN".equals(token)) {
            String fakeId = "MOCK_" + System.currentTimeMillis();
            return new ZoomMeetingInfo(
                    fakeId,
                    "https://zoom.us/j/" + fakeId,
                    "https://zoom.us/s/" + fakeId,
                    "mock123"
            );
        }

        String startTimeFormatted = startTime
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));

        Map<String, Object> body = Map.of(
                "topic", topic,
                "type", 2,  // Scheduled
                "start_time", startTimeFormatted,
                "duration", duration != null ? duration : 60,
                "timezone", "UTC",
                "settings", Map.of(
                        "host_video", true,
                        "participant_video", true,
                        "join_before_host", false,
                        "waiting_room", true,
                        "auto_recording", "none"
                )
        );

        Map<?, ?> response = webClient.post()
                .uri(apiBaseUrl + "/users/me/meetings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) throw new RuntimeException("Zoom API returned null response");

        return new ZoomMeetingInfo(
                response.get("id").toString(),
                (String) response.get("join_url"),
                (String) response.get("start_url"),
                (String) response.get("password")
        );
    }

    public void deleteMeeting(String meetingId) {
        if (meetingId.startsWith("MOCK_")) return;
        String token = getAccessToken();
        webClient.delete()
                .uri(apiBaseUrl + "/meetings/" + meetingId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .toBodilessEntity()
                .block();
        log.info("Zoom meeting {} deleted", meetingId);
    }
}
