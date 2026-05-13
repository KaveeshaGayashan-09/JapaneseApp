package com.nihongo.platform.dto;

import com.nihongo.platform.entity.Session;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class SessionDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String zoomJoinUrl;
    private String zoomMeetingId;
    private String zoomPasscode;
    private String createdByName;
    private boolean active;
    private boolean ended;
    private LocalDateTime createdAt;

    public static SessionDto from(Session s) {
        return SessionDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .scheduledAt(s.getScheduledAt())
                .durationMinutes(s.getDurationMinutes())
                .zoomJoinUrl(s.getZoomJoinUrl())
                .zoomMeetingId(s.getZoomMeetingId())
                .zoomPasscode(s.getZoomPasscode())
                .createdByName(s.getCreatedBy() != null ? s.getCreatedBy().getName() : null)
                .active(s.isActive())
                .ended(s.isEnded())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
