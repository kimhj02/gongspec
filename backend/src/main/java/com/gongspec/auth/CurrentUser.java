package com.gongspec.auth;

import com.gongspec.common.exception.ApiException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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
