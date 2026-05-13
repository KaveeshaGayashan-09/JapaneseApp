package com.nihongo.platform.controller;

import com.nihongo.platform.dto.SessionDto;
import com.nihongo.platform.dto.UserDto;
import com.nihongo.platform.entity.Announcement;
import com.nihongo.platform.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(studentService.getProfile(userId));
    }

    @GetMapping("/sessions/upcoming")
    public ResponseEntity<List<SessionDto>> getUpcoming(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(studentService.getUpcomingSessions(userId));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDto>> getAllSessions(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(studentService.getAllSessionsCalendar(userId));
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        return ResponseEntity.ok(studentService.getActiveAnnouncements());
    }
}
