package com.gongspec.common.dto;

/** 프론트에서 공통으로 읽는 message 필드 형태의 오류 응답이다. */
public record ErrorResponse(String message) {}
