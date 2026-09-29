package com.gongspec.common.config;

import com.gongspec.auth.config.AuthCookies;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** API 설명과 인증 방식을 정의하고 프록시 뒤에서도 현재 접속한 주소로 요청하도록 한다. */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI gongspecOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("GongSpec API")
                        .version("v1")
                        .description("공기업 취업 준비 자료·일정·채용공고·스터디 API. "
                                + "로그인 후 같은 사이트의 Swagger UI를 열면 기존 쿠키로 요청할 수 있습니다. "
                                + "JWT를 직접 사용하는 경우 Authorize에 Bearer 접두어 없이 토큰을 입력하세요."))
                // 절대 내부 호스트 대신 상대 주소를 사용해 직접 접속과 Next.js 프록시를 모두 지원한다.
                .addServersItem(new Server().url("/").description("현재 접속한 서버"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("GongSpec에서 발급한 JWT. 카카오 액세스 토큰과는 다릅니다."))
                        .addSecuritySchemes("cookieAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name(AuthCookies.TOKEN)
                                .description("사이트에서 카카오 로그인하면 발급되는 HttpOnly 쿠키. "
                                        + "Swagger 입력창에서 직접 설정하지 않고 브라우저의 기존 쿠키를 사용합니다.")));
    }
}
