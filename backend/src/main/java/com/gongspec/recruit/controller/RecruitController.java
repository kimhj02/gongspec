package com.gongspec.recruit.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.gongspec.recruit.dto.RecruitResponse;
import com.gongspec.recruit.dto.RecruitSyncResponse;
import com.gongspec.recruit.service.RecruitService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 진행 중 채용공고 검색과 수동 동기화 요청을 받아 응답 DTO로 반환한다. */
@Tag(name = "채용공고", description = "공개 공고 조회와 로그인 사용자용 동기화")
@RestController
@RequestMapping("/api/recruits")
public class RecruitController {

    private final RecruitService recruitService;

    public RecruitController(RecruitService recruitService) {
        this.recruitService = recruitService;
    }

    @GetMapping
    @Operation(summary = "진행 중 채용공고 검색")
    public List<RecruitResponse> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String hireType,
            @RequestParam(required = false) String instType) {
        return recruitService.list(query, hireType, instType).stream().map(RecruitResponse::from).toList();
    }

    @SecurityRequirement(name = "bearerAuth")
    @SecurityRequirement(name = "cookieAuth")
    @PostMapping("/sync")
    @Operation(summary = "ALIO 채용공고 동기화")
    public RecruitSyncResponse sync() {
        return recruitService.sync();
    }
}
