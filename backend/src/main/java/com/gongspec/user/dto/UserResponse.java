package com.gongspec.user.dto;

import com.gongspec.user.entity.User;
import java.time.Instant;

public record UserResponse(String id, String kakaoId, String nickname, String email, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getKakaoId(),
                user.getNickname(),
                user.getEmail(),
                user.getCreatedAt());
    }
}
