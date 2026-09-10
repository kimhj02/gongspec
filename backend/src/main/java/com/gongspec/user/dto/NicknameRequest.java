package com.gongspec.user.dto;

import jakarta.validation.constraints.NotBlank;

public record NicknameRequest(@NotBlank String nickname) {}
