package com.nihongo.platform.controller;

import com.nihongo.platform.dto.*;
import com.nihongo.platform.entity.Announcement;
import com.nihongo.platform.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ─── Dashboard ───────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ─── Students ────────────────────────────────────────────────────────────

    @GetMapping("/students/pending")
    public ResponseEntity<List<UserDto>> getPending() {
        return ResponseEntity.ok(adminService.getPendingStudents());
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserDto>> getAllStudents(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(adminService.getAllStudents(q));
    }

    @PatchMapping("/students/{id}/verify")
    public ResponseEntity<UserDto> verify(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.verifyStudent(id));
    }

    @PatchMapping("/students/{id}/reject")
    public ResponseEntity<UserDto> reject(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectStudent(id));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Sessions ────────────────────────────────────────────────────────────

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDto>> getSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    @PostMapping("/sessions")
    public ResponseEntity<SessionDto> createSession(
            @Valid @RequestBody SessionRequest req,
            Authentication auth) {
        Long adminId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(adminService.createSession(req, adminId));
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<SessionDto> updateSession(
            @PathVariable Long id,
            @Valid @RequestBody SessionRequest req) {
        return ResponseEntity.ok(adminService.updateSession(id, req));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        adminService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/{id}/start")
    public ResponseEntity<SessionDto> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.startSession(id));
    }

    // ─── Announcements ───────────────────────────────────────────────────────

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        return ResponseEntity.ok(adminService.getAnnouncements());
    }

    @PostMapping("/announcements")
    public ResponseEntity<Announcement> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest req,
            Authentication auth) {
        Long adminId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(adminService.createAnnouncement(req, adminId));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
}
