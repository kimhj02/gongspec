package com.gongspec.auth.config;

import java.time.Duration;
import org.springframework.http.ResponseCookie;

public final class AuthCookies {

    public static final String TOKEN = "gongspec_token";
    public static final String STATE = "gongspec_oauth_state";

    private AuthCookies() {}

    public static ResponseCookie token(String jwt, Duration maxAge) {
        return base(TOKEN, jwt).maxAge(maxAge).build();
    }

    public static ResponseCookie clearToken() {
        return base(TOKEN, "").maxAge(0).build();
    }

    public static ResponseCookie state(String state) {
        return base(STATE, state).maxAge(Duration.ofMinutes(10)).build();
    }

    public static ResponseCookie clearState() {
        return base(STATE, "").maxAge(0).build();
    }

    private static ResponseCookie.ResponseCookieBuilder base(String name, String value) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax");
    }
}
