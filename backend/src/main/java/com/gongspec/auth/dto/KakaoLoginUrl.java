package com.gongspec.auth.dto;

/** 로그인 시작 처리에서 사용할 인가 URL과 쿠키에 저장할 state를 함께 전달한다. */
public record KakaoLoginUrl(String url, String state) {}
