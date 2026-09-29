package com.gongspec.user.dto;

import jakarta.validation.constraints.NotBlank;

/** 현재 사용자가 설정할 사이트 닉네임을 받는다. */
public record NicknameRequest(@NotBlank String nickname) {}
