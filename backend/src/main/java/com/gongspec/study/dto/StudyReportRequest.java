package com.gongspec.study.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudyReportRequest(@NotBlank @Size(max = 300) String reason) {}
