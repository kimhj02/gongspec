package com.gongspec.user.dto;

import com.gongspec.user.entity.User;
import java.time.Instant;

public record UserResponse(
        String id,
        String kakaoId,
        String nickname,
        String email,
        Instant createdAt,
        boolean needsNickname,
        boolean admin) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getKakaoId(),
                user.displayNickname(),
                user.getEmail(),
                user.getCreatedAt(),
                user.needsNickname(),
                user.isAdmin());
    }
}
