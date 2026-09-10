package com.gongspec.study.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
class StudyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void requiresLogin() throws Exception {
        mockMvc.perform(get("/api/study/posts"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
    }

    @Test
    void createsListsAndCommentsWithoutContactInfo() throws Exception {
        Cookie token = nicknamedCookie("kakao-study", "공스펙");

        MvcResult created = mockMvc.perform(post("/api/study/posts")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "title":"한전 필기 스터디",
                                  "institution":"한국전력공사",
                                  "purpose":"필기",
                                  "mode":"온라인",
                                  "region":"서울",
                                  "capacity":4,
                                  "scheduleText":"주 2회",
                                  "body":"같이 기출 풀어요"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("한전 필기 스터디"))
                .andExpect(jsonPath("$.authorNickname").value("공스펙"))
                .andExpect(jsonPath("$.status").value("모집 중"))
                .andExpect(jsonPath("$.mine").value(true))
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/study/posts").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("한전 필기 스터디"))
                .andExpect(jsonPath("$[0].institution").value("한국전력공사"));

        mockMvc.perform(post("/api/study/posts/{id}/comments", id)
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"저도 참여하고 싶어요\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorNickname").value("공스펙"));

        mockMvc.perform(get("/api/study/posts/{id}/comments", id).cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(post("/api/study/posts/{id}/close", id).cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("마감"));
    }

    @Test
    void rejectsPhoneNumberInPost() throws Exception {
        Cookie token = nicknamedCookie("kakao-study-phone", "공스펙이");

        mockMvc.perform(post("/api/study/posts")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "title":"연락주세요 010-1234-5678",
                                  "institution":"한국전력공사",
                                  "purpose":"필기",
                                  "mode":"온라인"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void authorCanDeleteOwnPost() throws Exception {
        Cookie token = nicknamedCookie("kakao-study-del", "삭제닉");
        MvcResult created = mockMvc.perform(post("/api/study/posts")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "title":"지울 글",
                                  "institution":"한국마사회",
                                  "purpose":"면접",
                                  "mode":"혼합"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(delete("/api/study/posts/{id}", id).cookie(token)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/study/posts/{id}", id).cookie(token)).andExpect(status().isNotFound());
    }

    private Cookie nicknamedCookie(String kakaoId, String nickname) {
        User user = userService.upsertFromKakao(kakaoId, "카카오이름", null);
        userService.setSiteNickname(user.getId(), nickname);
        return new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(user.getId()));
    }
}
