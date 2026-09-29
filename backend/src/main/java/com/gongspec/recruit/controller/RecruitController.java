package com.gongspec.recruit.controller;

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
@RestController
@RequestMapping("/api/recruits")
public class RecruitController {

    private final RecruitService recruitService;

    public RecruitController(RecruitService recruitService) {
        this.recruitService = recruitService;
    }

    @GetMapping
    public List<RecruitResponse> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String hireType,
            @RequestParam(required = false) String instType) {
        return recruitService.list(query, hireType, instType).stream().map(RecruitResponse::from).toList();
    }

    @PostMapping("/sync")
    public RecruitSyncResponse sync() {
        return recruitService.sync();
    }
}
