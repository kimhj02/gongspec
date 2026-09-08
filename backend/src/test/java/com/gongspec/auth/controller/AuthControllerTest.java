package com.gongspec.auth.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.gongspec.auth.config.AuthCookies;
import com.gongspec.auth.dto.KakaoProfile;
import com.gongspec.auth.jwt.JwtTokenProvider;
import com.gongspec.auth.service.KakaoOAuthClient;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private KakaoOAuthClient kakaoOAuthClient;

    @Test
    void kakaoUrlIncludesClientAndStateCookie() throws Exception {
        mockMvc.perform(get("/api/auth/kakao/url"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString("kauth.kakao.com/oauth/authorize")))
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString("client_id=test-client-id")))
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString("redirect_uri=")))
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString("13001")))
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("scope="))))
                .andExpect(cookie().exists(AuthCookies.STATE))
                .andExpect(cookie().httpOnly(AuthCookies.STATE, true));
    }

    @Test
    void kakaoCallbackIssuesTokenCookieAndUser() throws Exception {
        when(kakaoOAuthClient.fetchProfile("auth-code"))
                .thenReturn(new KakaoProfile("kakao-99", "현진", "user@example.com"));
        Cookie stateCookie = oauthStateCookie();

        mockMvc.perform(post("/api/auth/kakao/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .cookie(stateCookie)
                        .content("{\"code\":\"auth-code\",\"state\":\"" + stateCookie.getValue() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kakaoId").value("kakao-99"))
                .andExpect(jsonPath("$.nickname").value("현진"))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(cookie().exists(AuthCookies.TOKEN))
                .andExpect(cookie().httpOnly(AuthCookies.TOKEN, true))
                .andExpect(cookie().maxAge(AuthCookies.STATE, 0));
    }

    @Test
    void kakaoCallbackRejectsMismatchedState() throws Exception {
        Cookie stateCookie = oauthStateCookie();

        mockMvc.perform(post("/api/auth/kakao/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .cookie(stateCookie)
                        .content("{\"code\":\"auth-code\",\"state\":\"other-state\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("카카오 로그인에 실패했습니다."));

        verify(kakaoOAuthClient, never()).fetchProfile(anyString());
    }

    @Test
    void meRequiresLogin() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
    }

    @Test
    void meReturnsCurrentUserFromCookie() throws Exception {
        User user = userService.upsertFromKakao("kakao-me", "공스펙", "me@example.com");
        String token = jwtTokenProvider.create(user.getId());

        mockMvc.perform(get("/api/auth/me").cookie(new Cookie(AuthCookies.TOKEN, token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.nickname").value("공스펙"));
    }

    @Test
    void logoutClearsTokenCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge(AuthCookies.TOKEN, 0));
    }

    private Cookie oauthStateCookie() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/kakao/url")).andReturn();
        return result.getResponse().getCookie(AuthCookies.STATE);
    }
}
