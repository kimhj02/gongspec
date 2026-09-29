package com.gongspec.auth.jwt;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** JWT 서명 비밀키와 토큰 유효기간을 jwt 설정에서 읽는다. */
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, Duration expire) {}
