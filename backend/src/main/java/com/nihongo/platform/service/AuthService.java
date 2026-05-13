package com.nihongo.platform.service;

import com.nihongo.platform.dto.RegistrationRequest;
import com.nihongo.platform.dto.UserDto;
import com.nihongo.platform.entity.Profile;
import com.nihongo.platform.entity.User;
import com.nihongo.platform.repository.ProfileRepository;
import com.nihongo.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository    userRepository;
    private final ProfileRepository profileRepository;

    @Transactional
    public UserDto completeRegistration(Long userId, RegistrationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(req.getName());

        Profile profile = profileRepository.findByUserId(userId).orElse(
                Profile.builder().user(user).build()
        );

        if (req.getJlptLevel() != null && !req.getJlptLevel().isEmpty()) {
            try {
                profile.setJlptLevel(Profile.JlptLevel.valueOf(req.getJlptLevel().toUpperCase()));
            } catch (IllegalArgumentException e) {
                profile.setJlptLevel(Profile.JlptLevel.NONE);
            }
        }
        profile.setBio(req.getBio());
        profile.setCountry(req.getCountry());
        profileRepository.save(profile);

        user.setProfile(profile);
        userRepository.save(user);
        log.info("Registration completed for user {}", user.getEmail());
        return UserDto.from(user);
    }

    public UserDto getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        profileRepository.findByUserId(userId).ifPresent(user::setProfile);
        return UserDto.from(user);
    }
}
