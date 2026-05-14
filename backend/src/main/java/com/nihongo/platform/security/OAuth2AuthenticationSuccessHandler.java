package com.nihongo.platform.security;

import com.nihongo.platform.repository.ProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final ProfileRepository profileRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();

        Long   userId    = (Long)    oAuth2User.getAttributes().get("userId");
        String role      = (String)  oAuth2User.getAttributes().get("userRole");
        String email     = (String)  oAuth2User.getAttributes().get("email");
        boolean isNewUser = (Boolean) oAuth2User.getAttributes().get("isNewUser");
        boolean hasProfile = !isNewUser && profileRepository.existsByUserId(userId);

        String token        = jwtTokenProvider.generateToken(userId, email, role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("token", token)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        log.info("OAuth2 success for user {} — redirecting to /oauth/callback", email);
        response.sendRedirect(redirectUrl);
    }
}
