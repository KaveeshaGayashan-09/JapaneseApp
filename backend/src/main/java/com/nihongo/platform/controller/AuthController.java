package com.nihongo.platform.controller;

import com.nihongo.platform.dto.RegistrationRequest;
import com.nihongo.platform.dto.UserDto;
import com.nihongo.platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Called after OAuth success to complete registration */
    @PostMapping("/complete-registration")
    public ResponseEntity<UserDto> completeRegistration(
            @Valid @RequestBody RegistrationRequest req,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(authService.completeRegistration(userId, req));
    }

    /** Returns current authenticated user */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(authService.getMe(userId));
    }

    /** Simple health ping for frontend to verify token validity */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
