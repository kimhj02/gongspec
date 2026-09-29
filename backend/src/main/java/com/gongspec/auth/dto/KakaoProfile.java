package com.gongspec.auth.dto;

/** 카카오 응답에서 추린 회원번호·닉네임·이메일을 사용자 갱신에 전달한다. */
public record KakaoProfile(String kakaoId, String nickname, String email) {}
