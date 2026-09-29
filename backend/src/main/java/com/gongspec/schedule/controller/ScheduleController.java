package com.gongspec.schedule.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.gongspec.auth.CurrentUser;
import com.gongspec.schedule.dto.ScheduleRequest;
import com.gongspec.schedule.dto.ScheduleResponse;
import com.gongspec.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 로그인 사용자의 일정 목록·등록·전체 수정·삭제를 HTTP API로 제공한다. */
@Tag(name = "일정", description = "개인 일정 관리")
@SecurityRequirement(name = "bearerAuth")
@SecurityRequirement(name = "cookieAuth")
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    @Operation(summary = "내 일정 조회")
    public List<ScheduleResponse> list() {
        return scheduleService.list(CurrentUser.id()).stream().map(ScheduleResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "일정 추가")
    public ScheduleResponse create(@Valid @RequestBody ScheduleRequest request) {
        return ScheduleResponse.from(scheduleService.create(CurrentUser.id(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "일정 수정")
    public ScheduleResponse replace(@PathVariable UUID id, @Valid @RequestBody ScheduleRequest request) {
        return ScheduleResponse.from(scheduleService.replace(CurrentUser.id(), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "일정 삭제")
    public void delete(@PathVariable UUID id) {
        scheduleService.delete(CurrentUser.id(), id);
    }
}
