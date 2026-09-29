package com.gongspec;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/** API 서버의 진입점. JPA 생성·수정 시각 기록, 설정 바인딩, 채용공고 정기 동기화를 활성화한다. */
@EnableJpaAuditing
@EnableScheduling
@ConfigurationPropertiesScan
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class GongspecApplication {

    public static void main(String[] args) {
        SpringApplication.run(GongspecApplication.class, args);
    }
}
