package com.gongspec.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record KakaoCallbackRequest(@NotBlank String code, @NotBlank String state) {}
