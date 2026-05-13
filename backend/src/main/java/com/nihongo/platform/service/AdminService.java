package com.nihongo.platform.service;

import com.nihongo.platform.dto.SessionDto;
import com.nihongo.platform.dto.SessionRequest;
import com.nihongo.platform.dto.UserDto;
import com.nihongo.platform.entity.Announcement;
import com.nihongo.platform.entity.Session;
import com.nihongo.platform.entity.User;
import com.nihongo.platform.repository.AnnouncementRepository;
import com.nihongo.platform.repository.ProfileRepository;
import com.nihongo.platform.repository.SessionRepository;
import com.nihongo.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository         userRepository;
    private final ProfileRepository      profileRepository;
    private final SessionRepository      sessionRepository;
    private final AnnouncementRepository announcementRepository;
    private final ZoomService            zoomService;

    // -------- Student Management --------

    public List<UserDto> getPendingStudents() {
        return userRepository.findByRoleAndStatus(User.Role.STUDENT, User.Status.PENDING)
                .stream().map(u -> {
                    profileRepository.findByUserId(u.getId()).ifPresent(u::setProfile);
                    return UserDto.from(u);
                }).collect(Collectors.toList());
    }

    public List<UserDto> getAllStudents(String query) {
        List<User> students = (query != null && !query.isBlank())
                ? userRepository.searchStudents(query)
                : userRepository.findByRole(User.Role.STUDENT);

        return students.stream().map(u -> {
            profileRepository.findByUserId(u.getId()).ifPresent(u::setProfile);
            return UserDto.from(u);
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserDto verifyStudent(Long studentId) {
        User user = findStudent(studentId);
        user.setStatus(User.Status.VERIFIED);
        userRepository.save(user);
        log.info("Student {} verified", user.getEmail());
        return UserDto.from(user);
    }

    @Transactional
    public UserDto rejectStudent(Long studentId) {
        User user = findStudent(studentId);
        user.setStatus(User.Status.REJECTED);
        userRepository.save(user);
        log.info("Student {} rejected", user.getEmail());
        return UserDto.from(user);
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        User user = findStudent(studentId);
        profileRepository.findByUserId(studentId).ifPresent(profileRepository::delete);
        userRepository.delete(user);
        log.info("Student {} deleted", user.getEmail());
    }

    private User findStudent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
        if (user.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("Cannot operate on non-student accounts");
        }
        return user;
    }

    // -------- Session Management --------

    public List<SessionDto> getAllSessions() {
        return sessionRepository.findAllByOrderByScheduledAtDesc()
                .stream().map(SessionDto::from).collect(Collectors.toList());
    }

    @Transactional
    public SessionDto createSession(SessionRequest req, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Session session = Session.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .scheduledAt(req.getScheduledAt())
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 60)
                .createdBy(admin)
                .build();

        // Call Zoom API to create meeting
        ZoomService.ZoomMeetingInfo zoom = zoomService.createMeeting(
                req.getTitle(), req.getScheduledAt(), req.getDurationMinutes());
        session.setZoomJoinUrl(zoom.joinUrl());
        session.setZoomMeetingId(zoom.meetingId());
        session.setZoomPasscode(zoom.passcode());
        session.setZoomStartUrl(zoom.startUrl());

        return SessionDto.from(sessionRepository.save(session));
    }

    @Transactional
    public SessionDto updateSession(Long sessionId, SessionRequest req) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        session.setTitle(req.getTitle());
        session.setDescription(req.getDescription());
        session.setScheduledAt(req.getScheduledAt());
        if (req.getDurationMinutes() != null) session.setDurationMinutes(req.getDurationMinutes());
        return SessionDto.from(sessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        if (session.getZoomMeetingId() != null) {
            try { zoomService.deleteMeeting(session.getZoomMeetingId()); } catch (Exception e) {
                log.warn("Failed to delete Zoom meeting {}: {}", session.getZoomMeetingId(), e.getMessage());
            }
        }
        sessionRepository.delete(session);
    }

    @Transactional
    public SessionDto startSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        session.setActive(true);
        sessionRepository.save(session);
        log.info("Session '{}' marked ACTIVE", session.getTitle());
        return SessionDto.from(session);
    }

    // -------- Dashboard Stats --------

    public java.util.Map<String, Long> getDashboardStats() {
        long total   = userRepository.findByRole(User.Role.STUDENT).size();
        long pending = userRepository.findByRoleAndStatus(User.Role.STUDENT, User.Status.PENDING).size();
        long active  = sessionRepository.findAllByOrderByScheduledAtDesc().stream()
                .filter(Session::isActive).count();
        return java.util.Map.of("totalStudents", total, "pendingStudents", pending, "activeSessions", active);
    }

    // -------- Announcements --------

    public List<Announcement> getAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional
    public Announcement createAnnouncement(com.nihongo.platform.dto.AnnouncementRequest req, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Announcement a = Announcement.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .active(req.isActive())
                .createdBy(admin)
                .build();
        return announcementRepository.save(a);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
