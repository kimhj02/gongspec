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
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
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
                .andExpect(jsonPath("$[0].id").value(first))
                .andExpect(jsonPath("$[1].id").value(second));

        mockMvc.perform(put("/api/resources/order")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[\"" + second + "\",\"" + first + "\"]}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/resources?tab=memo").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(second))
                .andExpect(jsonPath("$[1].id").value(first));
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
    void savesEssayWhenJoinedQuestionTitlesExceed255() throws Exception {
        Cookie token = tokenCookie();
        String question =
                "4. 국민건강보험공단이 추진하는 다양한 업무 중 향후 가장 중요해질 것이라고 생각하는 분야를 하나 선정하고, 그 이유와 해당 분야에서 본인이 기여할 수 있는 방안을 기술하시오.";
        String subtitle = String.join(", ", question, question, question, question);
        var mapper = JsonMapper.builder().build();
        String entries = mapper.writeValueAsString(List.of(
                Map.of("item", question, "essay", "답변 1"),
                Map.of("item", question, "essay", "답변 2"),
                Map.of("item", question, "essay", "답변 3"),
                Map.of("item", question, "essay", "답변 4")));

        mockMvc.perform(post("/api/resources")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of(
                                "tab",
                                "essays",
                                "title",
                                "2026년 국민건강보험공단",
                                "subtitle",
                                subtitle,
                                "details",
                                Map.of("entries", entries)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tab").value("essays"))
                .andExpect(jsonPath("$.subtitle").value(subtitle))
                .andExpect(jsonPath("$.details.entries").value(entries));
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

    @ParameterizedTest
    @EnumSource(ResourceTab.class)
    void isolatesResourcesBetweenUsers(ResourceTab tab) throws Exception {
        Cookie owner = tokenCookie();
        User otherUser = userService.upsertFromKakao("other-resource-user", "다른 사용자", "other@example.com");
        Cookie other = new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(otherUser.getId()));
        String body = JsonMapper.builder().build().writeValueAsString(Map.of("tab", tab, "title", "비공개 자료"));
        MvcResult created = mockMvc.perform(post("/api/resources").cookie(owner)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn();
        String id = JsonMapper.builder().build()
                .readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/resources").param("tab", tab.name()).cookie(other))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/api/resources").cookie(other))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(put("/api/resources/" + id).cookie(other)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"변경 시도\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/resources/order").cookie(other)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JsonMapper.builder().build().writeValueAsString(Map.of("ids", List.of(id)))))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/resources/" + id).cookie(other))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/resources").param("tab", tab.name()).cookie(owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].title").value("비공개 자료"));
    }

    private Cookie tokenCookie() {
        User user = userService.upsertFromKakao("kakao-resource", "현진", "r@example.com");
        return new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(user.getId()));
    }
}
