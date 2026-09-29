package com.gongspec.auth;

import com.gongspec.common.exception.ApiException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Spring Security 인증 정보에서 현재 요청의 사용자 UUID를 꺼낸다. 인증이 없으면 401 오류를 낸다. */
public final class CurrentUser {

    private CurrentUser() {}

    public static UUID id() {
        return id(SecurityContextHolder.getContext().getAuthentication());
    }

    public static UUID id(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        return userId;
    }
}
