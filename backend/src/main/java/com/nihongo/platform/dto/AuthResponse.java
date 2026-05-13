package com.nihongo.platform.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String refreshToken;
    private UserDto user;
    private boolean newUser;

    public AuthResponse(String token, String refreshToken, UserDto user, boolean newUser) {
        this.token        = token;
        this.refreshToken = refreshToken;
        this.user         = user;
        this.newUser      = newUser;
    }
}
