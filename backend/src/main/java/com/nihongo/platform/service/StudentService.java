package com.nihongo.platform.service;

import com.nihongo.platform.dto.SessionDto;
import com.nihongo.platform.dto.UserDto;
import com.nihongo.platform.entity.Announcement;
import com.nihongo.platform.entity.User;
import com.nihongo.platform.repository.AnnouncementRepository;
import com.nihongo.platform.repository.ProfileRepository;
import com.nihongo.platform.repository.SessionRepository;
import com.nihongo.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository         userRepository;
    private final ProfileRepository      profileRepository;
    private final SessionRepository      sessionRepository;
    private final AnnouncementRepository announcementRepository;

    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        profileRepository.findByUserId(userId).ifPresent(user::setProfile);
        return UserDto.from(user);
    }

    public List<SessionDto> getUpcomingSessions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != User.Status.VERIFIED) {
            throw new RuntimeException("Account not verified — sessions are not accessible yet");
        }
        return sessionRepository.findByScheduledAtAfterOrderByScheduledAtAsc(LocalDateTime.now())
                .stream().map(SessionDto::from).collect(Collectors.toList());
    }

    public List<SessionDto> getAllSessionsCalendar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getStatus() != User.Status.VERIFIED) {
            throw new RuntimeException("Account not verified");
        }
        return sessionRepository.findAllByOrderByScheduledAtDesc()
                .stream().map(SessionDto::from).collect(Collectors.toList());
    }

    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
    }
}
