package com.gongspec.admin.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void nonAdminCannotSeeReports() throws Exception {
        Cookie token = nicknamedCookie("kakao-member", "일반닉");
        mockMvc.perform(get("/api/admin/reports").cookie(token)).andExpect(status().isForbidden());
    }

    @Test
    void adminHidesReportedPost() throws Exception {
        Cookie member = nicknamedCookie("kakao-reporter", "신고닉");
        Cookie admin = nicknamedCookie("admin-kakao", "관리닉");

        MvcResult created = mockMvc.perform(post("/api/study/posts")
                        .cookie(member)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "title":"숨길 글",
                                  "institution":"한국전력공사",
                                  "purpose":"NCS",
                                  "mode":"오프라인"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String postId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/study/posts/{id}/reports", postId)
                        .cookie(member)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"광고 같아요\"}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/admin/reports").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].postTitle").value("숨길 글"))
                .andExpect(jsonPath("$[0].hidden").value(false));

        mockMvc.perform(post("/api/admin/posts/{id}/hide", postId).cookie(admin)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/study/posts/{id}", postId).cookie(member)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/admin/reports").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].hidden").value(true));
    }

    private Cookie nicknamedCookie(String kakaoId, String nickname) {
        User user = userService.upsertFromKakao(kakaoId, "카카오이름", null);
        userService.setSiteNickname(user.getId(), nickname);
        return new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(user.getId()));
    }
}
