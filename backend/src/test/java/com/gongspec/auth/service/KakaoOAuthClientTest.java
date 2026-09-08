package com.gongspec.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.gongspec.auth.config.KakaoProperties;
import com.gongspec.auth.dto.KakaoProfile;
import com.gongspec.common.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class KakaoOAuthClientTest {

    private MockRestServiceServer server;
    private KakaoOAuthClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new KakaoOAuthClient(
                builder.build(),
                new KakaoProperties("rest-key", "secret", "http://localhost:13001/auth/kakao/callback"));
    }

    @Test
    void fetchesNicknameAndEmail() {
        server.expect(requestTo("https://kauth.kakao.com/oauth/token"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"access_token\":\"kakao-access\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://kapi.kakao.com/v2/user/me"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer kakao-access"))
                .andRespond(withSuccess(
                        """
                        {"id":12345,"kakao_account":{"email":"user@example.com","profile":{"nickname":"현진"}}}
                        """,
                        MediaType.APPLICATION_JSON));

        KakaoProfile profile = client.fetchProfile("auth-code");

        assertThat(profile.kakaoId()).isEqualTo("12345");
        assertThat(profile.nickname()).isEqualTo("현진");
        assertThat(profile.email()).isEqualTo("user@example.com");
        server.verify();
    }

    @Test
    void usesFallbackNicknameWhenEmailDenied() {
        server.expect(requestTo("https://kauth.kakao.com/oauth/token"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"access_token\":\"kakao-access\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://kapi.kakao.com/v2/user/me"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"id\":99,\"kakao_account\":{}}", MediaType.APPLICATION_JSON));

        KakaoProfile profile = client.fetchProfile("auth-code");

        assertThat(profile.kakaoId()).isEqualTo("99");
        assertThat(profile.nickname()).isEqualTo("사용자");
        assertThat(profile.email()).isNull();
    }

    @Test
    void throwsWhenTokenExchangeFails() {
        server.expect(requestTo("https://kauth.kakao.com/oauth/token"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest());

        assertThatThrownBy(() -> client.fetchProfile("bad-code")).isInstanceOf(ApiException.class);
    }
}
