package com.gongspec.auth.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gongspec.auth.config.KakaoProperties;
import com.gongspec.auth.dto.KakaoProfile;
import com.gongspec.common.exception.ApiException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class KakaoOAuthClient {

    private static final String TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String USER_URL = "https://kapi.kakao.com/v2/user/me";
    private static final String DEFAULT_NICKNAME = "사용자";

    private final RestClient restClient;
    private final KakaoProperties properties;

    public KakaoOAuthClient(RestClient restClient, KakaoProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public KakaoProfile fetchProfile(String code) {
        try {
            KakaoTokenResponse token = restClient.post()
                    .uri(TOKEN_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(tokenRequest(code))
                    .retrieve()
                    .body(KakaoTokenResponse.class);
            if (token == null || token.accessToken() == null || token.accessToken().isBlank()) {
                throw loginFailed();
            }

            KakaoUserResponse user = restClient.get()
                    .uri(USER_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token.accessToken())
                    .retrieve()
                    .body(KakaoUserResponse.class);
            if (user == null || user.id() == null) {
                throw loginFailed();
            }
            return new KakaoProfile(String.valueOf(user.id()), user.nickname(), user.email());
        } catch (RestClientException exception) {
            throw loginFailed();
        }
    }

    private MultiValueMap<String, String> tokenRequest(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", properties.clientId());
        form.add("redirect_uri", properties.redirectUri());
        form.add("code", code);
        if (properties.clientSecret() != null && !properties.clientSecret().isBlank()) {
            form.add("client_secret", properties.clientSecret());
        }
        return form;
    }

    private static ApiException loginFailed() {
        return ApiException.unauthorized("카카오 로그인에 실패했습니다.");
    }

    record KakaoTokenResponse(@JsonProperty("access_token") String accessToken) {}

    record KakaoUserResponse(Long id, @JsonProperty("kakao_account") KakaoAccount kakaoAccount) {
        String nickname() {
            String nickname = kakaoAccount == null || kakaoAccount.profile() == null
                    ? null
                    : kakaoAccount.profile().nickname();
            return nickname == null || nickname.isBlank() ? DEFAULT_NICKNAME : nickname;
        }

        String email() {
            return kakaoAccount == null ? null : kakaoAccount.email();
        }
    }

    record KakaoAccount(String email, KakaoProfilePayload profile) {}

    record KakaoProfilePayload(String nickname) {}
}
