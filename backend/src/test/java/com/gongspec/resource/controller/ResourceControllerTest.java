package com.gongspec.resource.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.json.JsonMapper;
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
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void requiresLogin() throws Exception {
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
    }

    @Test
    void createsMergesSearchesAndDeletesResource() throws Exception {
        Cookie token = tokenCookie();

        MvcResult created = mockMvc.perform(post("/api/resources")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tab":"certificate","title":"정보처리기사","details":{"credential":"기사","issuer":"큐넷"}}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tab").value("certificate"))
                .andExpect(jsonPath("$.pinned").value(false))
                .andExpect(jsonPath("$.details.credential").value("기사"))
                .andReturn();
        String id = JsonMapper.builder().build().readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(put("/api/resources/" + id)
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pinned\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pinned").value(true))
                .andExpect(jsonPath("$.title").value("정보처리기사"))
                .andExpect(jsonPath("$.details.issuer").value("큐넷"));

        mockMvc.perform(get("/api/resources?tab=certificate&query=큐넷").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(get("/api/resources?tab=memo").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(delete("/api/resources/" + id).cookie(token)).andExpect(status().isNoContent());
    }

    @Test
    void reordersResourcesInTheSameTab() throws Exception {
        Cookie token = tokenCookie();
        String first = JsonMapper.builder().build().readTree(mockMvc.perform(post("/api/resources")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tab\":\"memo\",\"title\":\"첫번째\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString()).get("id").asText();
        String second = JsonMapper.builder().build().readTree(mockMvc.perform(post("/api/resources")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tab\":\"memo\",\"title\":\"두번째\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/resources?tab=memo").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(second))
                .andExpect(jsonPath("$[1].id").value(first));

        mockMvc.perform(put("/api/resources/order")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[\"" + first + "\",\"" + second + "\"]}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/resources?tab=memo").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(first))
                .andExpect(jsonPath("$[1].id").value(second));
    }

    @Test
    void savesProjectWithEssayReadyDetails() throws Exception {
        Cookie token = tokenCookie();

        mockMvc.perform(post("/api/resources")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tab":"project","title":"MediCheck","subtitle":"공공데이터로 근처 병원을 찾는 서비스","details":{"name":"MediCheck","oneLiner":"공공데이터로 근처 병원을 찾는 서비스","role":"1인 풀스택","url":"https://medicheck.life","work":"Spring Boot API를 구현했다."}}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tab").value("project"))
                .andExpect(jsonPath("$.title").value("MediCheck"))
                .andExpect(jsonPath("$.details.name").value("MediCheck"))
                .andExpect(jsonPath("$.details.role").value("1인 풀스택"))
                .andExpect(jsonPath("$.details.url").value("https://medicheck.life"));

        mockMvc.perform(get("/api/resources?tab=project&query=병원").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("MediCheck"));
    }

    @Test
    void savesSecondInterviewRoundOnApplication() throws Exception {
        Cookie token = tokenCookie();

        mockMvc.perform(post("/api/resources")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tab":"applications","title":"9급 행정직","details":{"institution":"서울교통공사","posting":"9급 행정직","interview2At":"2026-10-20","interview2Result":"대기중"}}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tab").value("applications"))
                .andExpect(jsonPath("$.details.interview2At").value("2026-10-20"))
                .andExpect(jsonPath("$.details.interview2Result").value("대기중"));
    }

    private Cookie tokenCookie() {
        User user = userService.upsertFromKakao("kakao-resource", "현진", "r@example.com");
        return new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(user.getId()));
    }
}
