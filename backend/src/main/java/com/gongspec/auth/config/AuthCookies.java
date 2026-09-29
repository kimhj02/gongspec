package com.gongspec.auth.config;

import java.time.Duration;
import org.springframework.http.ResponseCookie;

/** 로그인 JWT와 OAuth state 쿠키의 이름·수명·HttpOnly·SameSite 설정을 한곳에서 관리한다. */
public final class AuthCookies {

    public static final String TOKEN = "gongspec_token";
    public static final String STATE = "gongspec_oauth_state";

    private AuthCookies() {}

    public static ResponseCookie token(String jwt, Duration maxAge) {
        return token(jwt, maxAge, false);
    }

    public static ResponseCookie token(String jwt, Duration maxAge, boolean secure) {
        return base(TOKEN, jwt, secure).maxAge(maxAge).build();
    }

    public static ResponseCookie clearToken() {
        return clearToken(false);
    }

    public static ResponseCookie clearToken(boolean secure) {
        return base(TOKEN, "", secure).maxAge(0).build();
    }

    public static ResponseCookie state(String state) {
        return state(state, false);
    }

    public static ResponseCookie state(String state, boolean secure) {
        return base(STATE, state, secure).maxAge(Duration.ofMinutes(10)).build();
    }

    public static ResponseCookie clearState() {
        return clearState(false);
    }

    public static ResponseCookie clearState(boolean secure) {
        return base(STATE, "", secure).maxAge(0).build();
    }

    private static ResponseCookie.ResponseCookieBuilder base(String name, String value, boolean secure) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite("Lax");
    }
}
