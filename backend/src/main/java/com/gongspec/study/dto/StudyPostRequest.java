package com.gongspec.study.dto;

import com.gongspec.study.entity.StudyMode;
import com.gongspec.study.entity.StudyPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudyPostRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 120) String institution,
        String recruitId,
        @NotNull StudyPurpose purpose,
        @NotNull StudyMode mode,
        @Size(max = 80) String region,
        Integer capacity,
        @Size(max = 200) String scheduleText,
        @Size(max = 4000) String body) {}
