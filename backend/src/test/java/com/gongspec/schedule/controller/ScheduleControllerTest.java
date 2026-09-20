package com.gongspec.schedule.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.gongspec.auth.config.AuthCookies;
import com.gongspec.auth.jwt.JwtTokenProvider;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void requiresLogin() throws Exception {
        mockMvc.perform(get("/api/schedules"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
    }

    @Test
    void createsReplacesAndDeletesSchedule() throws Exception {
        Cookie token = tokenCookie();

        MvcResult created = mockMvc.perform(post("/api/schedules")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"NCS","date":"2026-09-20","endDate":"2026-09-21","memo":"준비","type":"필기"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("NCS"))
                .andExpect(jsonPath("$.endDate").value("2026-09-21"))
                .andExpect(jsonPath("$.type").value("필기"))
                .andReturn();
        String id = com.fasterxml.jackson.databind.json.JsonMapper.builder()
                .build()
                .readTree(created.getResponse().getContentAsString())
                .get("id")
                .asText();

        mockMvc.perform(put("/api/schedules/" + id)
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"NCS","date":"2026-09-20","type":"필기"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.endDate").doesNotExist())
                .andExpect(jsonPath("$.memo").doesNotExist());

        mockMvc.perform(get("/api/schedules").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(delete("/api/schedules/" + id).cookie(token)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/schedules").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void cannotReadChangeOrDeleteAnotherUsersSchedule() throws Exception {
        Cookie owner = tokenCookie();
        User otherUser = userService.upsertFromKakao("other-schedule-user", "다른 사용자", "other@example.com");
        Cookie other = new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(otherUser.getId()));
        String body = """
                {"title":"비공개 일정","date":"2026-09-20","type":"필기"}
                """;
        MvcResult created = mockMvc.perform(post("/api/schedules")
                        .cookie(owner).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn();
        String id = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/schedules").cookie(other))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(put("/api/schedules/" + id).cookie(other)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("비공개 일정", "변경 시도")))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/schedules/" + id).cookie(other))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/schedules").cookie(owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].title").value("비공개 일정"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "{\"title\":\" \",\"date\":\"2026-09-20\",\"type\":\"필기\"}",
        "{\"title\":\"NCS\",\"date\":\"\",\"type\":\"필기\"}",
        "{\"title\":\"NCS\",\"date\":\"2026-09-20\"}"
    })
    void rejectsInvalidScheduleWithoutSaving(String body) throws Exception {
        Cookie token = tokenCookie();
        mockMvc.perform(post("/api/schedules").cookie(token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/schedules").cookie(token))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
    }

    private Cookie tokenCookie() {
        User user = userService.upsertFromKakao("kakao-schedule", "현진", "s@example.com");
        return new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(user.getId()));
    }
}
