package com.gongspec.recruit.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gongspec.auth.config.AuthCookies;
import com.gongspec.auth.jwt.JwtTokenProvider;
import com.gongspec.recruit.client.AlioRecruitClient;
import com.gongspec.recruit.entity.PublicRecruit;
import com.gongspec.recruit.repository.PublicRecruitRepository;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RecruitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PublicRecruitRepository repository;

    @MockitoBean
    private AlioRecruitClient alioRecruitClient;

    @Test
    void requiresLogin() throws Exception {
        mockMvc.perform(get("/api/recruits"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
        mockMvc.perform(post("/api/recruits/sync"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listsOngoingRecruitsAndFiltersHireType() throws Exception {
        Cookie token = tokenCookie();
        repository.save(recruit(1L, "한국전력", "정규직 채용", "정규직", "정규직"));
        repository.save(recruit(2L, "한국마사회", "계약직 채용", "계약직", "계약직"));

        mockMvc.perform(get("/api/recruits?query=한국전력").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("정규직 채용"))
                .andExpect(jsonPath("$[0].instNm").value("한국전력"));

        mockMvc.perform(get("/api/recruits?hireType=계약직").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].hireType").value("계약직"));
    }

    @Test
    void syncsFromAlioWhenLoggedIn() throws Exception {
        Cookie token = tokenCookie();
        ObjectNode item = new ObjectMapper().createObjectNode();
        item.put("recrutPblntSn", 77);
        item.put("recrutPbancTtl", "체험형 인턴");
        item.put("instNm", "한국농어촌공사");
        item.put("hireTypeLst", "R1060");
        item.put("pbancBgngYmd", "20260901");
        item.put("pbancEndYmd", "20260920");
        item.put("srcUrl", "https://example.com/notice");
        when(alioRecruitClient.fetchOngoing(1)).thenReturn(new AlioRecruitClient.Page(List.of(item), 1));

        mockMvc.perform(post("/api/recruits/sync").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved").value(1));

        mockMvc.perform(get("/api/recruits?hireType=인턴").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("체험형 인턴"))
                .andExpect(jsonPath("$[0].hireType").value("인턴"));
    }

    private PublicRecruit recruit(long serial, String instNm, String title, String hireType, String hireTypes) {
        PublicRecruit recruit = new PublicRecruit(serial, title);
        recruit.replace(
                instNm,
                title,
                hireType,
                hireTypes,
                "",
                "신입",
                "서울",
                "2026-09-01",
                "2026-09-30",
                true,
                "https://example.com",
                1,
                "",
                Instant.parse("2026-09-09T00:00:00Z"));
        return recruit;
    }

    private Cookie tokenCookie() {
        User user = userService.upsertFromKakao("kakao-recruit", "현진", "recruit@example.com");
        return new Cookie(AuthCookies.TOKEN, jwtTokenProvider.create(user.getId()));
    }
}
