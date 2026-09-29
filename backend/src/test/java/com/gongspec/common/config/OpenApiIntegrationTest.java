package com.gongspec.common.config;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.gongspec.auth.config.AuthCookies;
import com.gongspec.auth.jwt.JwtTokenProvider;
import com.gongspec.user.service.UserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OpenApiIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserService userService;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    @Test
    void servesSwaggerUiAndConfigurationWithoutLogin() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/swagger-ui/index.html"));
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Swagger UI")));
        mockMvc.perform(get("/swagger-ui/swagger-initializer.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/v3/api-docs/swagger-config")));
        mockMvc.perform(get("/v3/api-docs/swagger-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("/v3/api-docs"));
    }

    @Test
    void documentsPublicAndProtectedOperationsAndUsesRelativeServer() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("GongSpec API"))
                .andExpect(jsonPath("$.servers[0].url").value("/"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.cookieAuth.name").value(AuthCookies.TOKEN))
                .andExpect(jsonPath("$.paths['/api/resources'].get.security[0].bearerAuth").isArray())
                .andExpect(jsonPath("$.paths['/api/resources'].get.security[1].cookieAuth").isArray())
                .andExpect(jsonPath("$.paths['/api/auth/me'].get.security").isNotEmpty())
                .andExpect(jsonPath("$.paths['/api/recruits/sync'].post.security").isNotEmpty())
                .andExpect(jsonPath("$.paths['/api/admin/reports'].get.security").isNotEmpty())
                .andExpect(jsonPath("$.paths['/api/health'].get.security").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/recruits'].get.security").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/auth/kakao/url'].get.security").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/auth/logout'].post.security").doesNotExist());
    }

    @Test
    void keepsApiProtectedAndAcceptsBothDocumentedAuthenticationMethods() throws Exception {
        mockMvc.perform(get("/api/resources")).andExpect(status().isUnauthorized());
        var user = userService.upsertFromKakao("swagger-test", "테스트", null);
        String token = jwtTokenProvider.create(user.getId());
        mockMvc.perform(get("/api/resources").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/resources").cookie(new Cookie(AuthCookies.TOKEN, token)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}
