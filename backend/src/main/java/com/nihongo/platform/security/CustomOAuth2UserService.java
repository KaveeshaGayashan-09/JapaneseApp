package com.nihongo.platform.security;

import com.nihongo.platform.entity.User;
import com.nihongo.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String oauthId, email, name, avatarUrl;

        if ("google".equals(provider)) {
            oauthId   = (String) attributes.get("sub");
            email     = (String) attributes.get("email");
            name      = (String) attributes.get("name");
            avatarUrl = (String) attributes.get("picture");
        } else { // facebook
            oauthId   = (String) attributes.get("id");
            email     = (String) attributes.get("email");
            name      = (String) attributes.get("name");
            Map<?, ?> picture = (Map<?, ?>) attributes.get("picture");
            avatarUrl = picture != null
                    ? (String) ((Map<?, ?>) picture.get("data")).get("url") : null;
        }

        boolean isNewUser = false;
        Optional<User> existing = userRepository.findByOauthIdAndOauthProvider(oauthId, provider);
        User user;
        if (existing.isEmpty()) {
            // Also check by email (user may have registered with different provider)
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                user = byEmail.get();
                user.setOauthId(oauthId);
                user.setOauthProvider(provider);
            } else {
                user = User.builder()
                        .name(name)
                        .email(email)
                        .oauthId(oauthId)
                        .oauthProvider(provider)
                        .avatarUrl(avatarUrl)
                        .role(User.Role.STUDENT)
                        .status(User.Status.PENDING)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                isNewUser = true;
            }
            userRepository.save(user);
        } else {
            user = existing.get();
            user.setUpdatedAt(LocalDateTime.now());
            if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        }

        Map<String, Object> enriched = new HashMap<>(attributes);
        enriched.put("userId",    user.getId());
        enriched.put("userRole",  user.getRole().name());
        enriched.put("userStatus",user.getStatus().name());
        enriched.put("isNewUser", isNewUser);
        enriched.put("provider",  provider);

        String nameAttrKey = "google".equals(provider) ? "sub" : "id";
        return new DefaultOAuth2User(oAuth2User.getAuthorities(), enriched, nameAttrKey);
    }
}
