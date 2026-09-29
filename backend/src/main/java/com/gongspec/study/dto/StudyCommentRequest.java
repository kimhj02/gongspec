package com.gongspec.study.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 필수 댓글 본문을 받으며 최대 1,000자로 제한한다. */
public record StudyCommentRequest(@NotBlank @Size(max = 1000) String body) {}
