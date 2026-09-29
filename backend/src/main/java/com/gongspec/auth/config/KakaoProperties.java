package com.gongspec.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** kakao 설정을 OAuth 앱 키, 비밀키, 콜백 주소로 바인딩한다. */
@ConfigurationProperties(prefix = "kakao")
public record KakaoProperties(String clientId, String clientSecret, String redirectUri) {}
