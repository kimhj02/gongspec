package com.gongspec.user.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.gongspec.auth.config.AuthCookies;
import com.gongspec.auth.jwt.JwtTokenProvider;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void setsSiteNicknameAfterLogin() throws Exception {
        User user = userService.upsertFromKakao("kakao-nick", "현진", null);
        String token = jwtTokenProvider.create(user.getId());

        mockMvc.perform(put("/api/users/me/nickname")
                        .cookie(new Cookie(AuthCookies.TOKEN, token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"공스펙\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("공스펙"))
                .andExpect(jsonPath("$.needsNickname").value(false));
    }

    @Test
    void rejectsPhoneNumberAsNickname() throws Exception {
        User user = userService.upsertFromKakao("kakao-phone", "현진", null);
        String token = jwtTokenProvider.create(user.getId());

        mockMvc.perform(put("/api/users/me/nickname")
                        .cookie(new Cookie(AuthCookies.TOKEN, token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"01012345678\"}"))
                .andExpect(status().isBadRequest());
    }
}
