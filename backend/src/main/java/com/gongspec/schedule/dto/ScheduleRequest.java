package com.gongspec.schedule.dto;

import com.gongspec.schedule.entity.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** 일정 생성·수정에 사용하는 제목·날짜 범위·메모·유형 입력이다. */
public record ScheduleRequest(
        @NotBlank String title,
        @NotBlank String date,
        String endDate,
        String memo,
        @NotNull ScheduleType type) {}
