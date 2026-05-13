package com.nihongo.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions", indexes = {
        @Index(name = "idx_session_date", columnList = "scheduledAt"),
        @Index(name = "idx_session_active", columnList = "active")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    /** Duration in minutes */
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(length = 500)
    private String zoomJoinUrl;

    @Column(length = 100)
    private String zoomMeetingId;

    @Column(length = 20)
    private String zoomPasscode;

    @Column(length = 500)
    private String zoomStartUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /** True = admin has started the meeting; Join buttons activate */
    @Builder.Default
    private boolean active = false;

    /** True = meeting has ended */
    @Builder.Default
    private boolean ended = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}
