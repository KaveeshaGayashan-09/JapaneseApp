package com.nihongo.platform.dto;

import com.nihongo.platform.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private User.Role role;
    private User.Status status;
    private String jlptLevel;
    private String bio;
    private String country;
    private LocalDateTime createdAt;

    public static UserDto from(User user) {
        UserDtoBuilder b = UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt());

        if (user.getProfile() != null) {
            b.jlptLevel(user.getProfile().getJlptLevel() != null
                    ? user.getProfile().getJlptLevel().name() : null)
             .bio(user.getProfile().getBio())
             .country(user.getProfile().getCountry());
        }
        return b.build();
    }
}
