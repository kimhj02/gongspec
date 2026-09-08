package com.gongspec.auth.service;

import com.gongspec.auth.config.KakaoProperties;
import com.gongspec.auth.dto.KakaoLoginUrl;
import com.gongspec.auth.jwt.JwtTokenProvider;
import com.gongspec.common.exception.ApiException;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthService {

    private final KakaoProperties kakaoProperties;
    private final KakaoOAuthClient kakaoOAuthClient;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            KakaoProperties kakaoProperties,
            KakaoOAuthClient kakaoOAuthClient,
            UserService userService,
            JwtTokenProvider jwtTokenProvider) {
        this.kakaoProperties = kakaoProperties;
        this.kakaoOAuthClient = kakaoOAuthClient;
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public KakaoLoginUrl createLoginUrl() {
        if (kakaoProperties.clientId() == null || kakaoProperties.clientId().isBlank()) {
            throw ApiException.badRequest("카카오 앱 키가 설정되지 않았습니다.");
        }
        String state = UUID.randomUUID().toString();
        String url = UriComponentsBuilder.fromUriString("https://kauth.kakao.com/oauth/authorize")
                .queryParam("client_id", kakaoProperties.clientId())
                .queryParam("redirect_uri", kakaoProperties.redirectUri())
                .queryParam("response_type", "code")
                .queryParam("state", state)
                .encode()
                .build()
                .toUriString();
        return new KakaoLoginUrl(url, state);
    }

    public User loginWithKakao(String code) {
        var profile = kakaoOAuthClient.fetchProfile(code);
        return userService.upsertFromKakao(profile.kakaoId(), profile.nickname(), profile.email());
    }

    public String createToken(User user) {
        return jwtTokenProvider.create(user.getId());
    }

    public void verifyState(String cookieState, String bodyState) {
        if (cookieState == null || cookieState.isBlank() || !cookieState.equals(bodyState)) {
            throw ApiException.unauthorized("카카오 로그인에 실패했습니다.");
        }
    }
}
