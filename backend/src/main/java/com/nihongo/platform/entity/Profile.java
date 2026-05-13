package com.nihongo.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Profile {

    public enum JlptLevel { N5, N4, N3, N2, N1, BEGINNER, NONE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private JlptLevel jlptLevel = JlptLevel.NONE;

    @Column(length = 1000)
    private String bio;

    @Column(length = 500)
    private String profilePictureUrl;

    /** Country / time-zone info */
    @Column(length = 100)
    private String country;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
