package com.gongspec.user.dto;

import com.gongspec.user.entity.User;
import java.time.Instant;

/** 현재 사용자 정보와 닉네임 설정 필요 여부·관리자 여부를 화면에 전달한다. */
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
