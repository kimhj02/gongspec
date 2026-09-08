package com.gongspec.auth.controller;

import com.gongspec.auth.config.AuthCookies;
import com.gongspec.auth.dto.KakaoCallbackRequest;
import com.gongspec.auth.dto.KakaoLoginUrl;
import com.gongspec.auth.dto.KakaoLoginUrlResponse;
import com.gongspec.auth.jwt.JwtProperties;
import com.gongspec.auth.service.AuthService;
import com.gongspec.common.config.AppProperties;
import com.gongspec.common.exception.ApiException;
import com.gongspec.user.dto.UserResponse;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtProperties jwtProperties;
    private final AppProperties appProperties;

    public AuthController(
            AuthService authService, UserService userService, JwtProperties jwtProperties, AppProperties appProperties) {
        this.authService = authService;
        this.userService = userService;
        this.jwtProperties = jwtProperties;
        this.appProperties = appProperties;
    }

    @GetMapping("/kakao/url")
    public ResponseEntity<KakaoLoginUrlResponse> kakaoUrl() {
        KakaoLoginUrl loginUrl = authService.createLoginUrl();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, AuthCookies.state(loginUrl.state(), cookieSecure()).toString())
                .body(new KakaoLoginUrlResponse(loginUrl.url()));
    }

    @PostMapping("/kakao/callback")
    public ResponseEntity<UserResponse> kakaoCallback(
            @Valid @RequestBody KakaoCallbackRequest request,
            @CookieValue(value = AuthCookies.STATE, required = false) String stateCookie) {
        authService.verifyState(stateCookie, request.state());
        User user = authService.loginWithKakao(request.code());
        String token = authService.createToken(user);
        return ResponseEntity.ok()
                .headers(headers -> {
                    headers.add(HttpHeaders.SET_COOKIE, AuthCookies.token(token, jwtProperties.expire(), cookieSecure()).toString());
                    headers.add(HttpHeaders.SET_COOKIE, AuthCookies.clearState(cookieSecure()).toString());
                })
                .body(UserResponse.from(user));
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(userService.getById(currentUserId(authentication)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, AuthCookies.clearToken(cookieSecure()).toString())
                .build();
    }

    private boolean cookieSecure() {
        return appProperties.cookie() != null && appProperties.cookie().secure();
    }

    private static UUID currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        return userId;
    }
}
