package com.gongspec.schedule.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gongspec.schedule.entity.Schedule;
import com.gongspec.schedule.entity.ScheduleType;

/** 일정 엔티티를 화면용 데이터로 변환하며 null 선택 필드는 JSON에서 생략한다. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScheduleResponse(String id, String title, String date, String endDate, String memo, ScheduleType type) {

    public static ScheduleResponse from(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId().toString(),
                schedule.getTitle(),
                schedule.getDate(),
                schedule.getEndDate(),
                schedule.getMemo(),
                schedule.getType());
    }
}
