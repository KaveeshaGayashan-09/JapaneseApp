package com.nihongo.platform;

import com.nihongo.platform.entity.User;
import com.nihongo.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@SpringBootApplication
@RequiredArgsConstructor
@Slf4j
public class NihongoPlatformApplication implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email}")
    private String adminEmail;

    @Value("${app.admin.default-password}")
    private String adminPassword;

    @Value("${app.admin.default-name}")
    private String adminName;

    public static void main(String[] args) {
        SpringApplication.run(NihongoPlatformApplication.class, args);
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .status(User.Status.VERIFIED)
                    .oauthProvider("local")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin account created: {}", adminEmail);
        } else {
            log.info("ℹ️  Admin account already exists — skipping seed.");
        }
    }
}
