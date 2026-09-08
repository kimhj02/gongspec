package com.gongspec.schedule.dto;

import com.gongspec.schedule.entity.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ScheduleRequest(
        @NotBlank String title,
        @NotBlank String date,
        String endDate,
        String memo,
        @NotNull ScheduleType type) {}
