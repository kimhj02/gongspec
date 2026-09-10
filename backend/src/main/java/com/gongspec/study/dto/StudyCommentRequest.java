package com.gongspec.study.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudyCommentRequest(@NotBlank @Size(max = 1000) String body) {}
