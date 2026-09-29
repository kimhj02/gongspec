package com.gongspec.study.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 필수 신고 사유를 받으며 최대 300자로 제한한다. */
public record StudyReportRequest(@NotBlank @Size(max = 300) String reason) {}
