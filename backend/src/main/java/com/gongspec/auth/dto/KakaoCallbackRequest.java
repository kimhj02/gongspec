package com.gongspec.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** 프론트에서 전달한 카카오 인가 코드와 OAuth state를 받는다. */
public record KakaoCallbackRequest(@NotBlank String code, @NotBlank String state) {}
