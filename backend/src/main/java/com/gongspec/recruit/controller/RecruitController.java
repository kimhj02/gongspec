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

@RestController
@RequestMapping("/api/recruits")
public class RecruitController {

    private final RecruitService recruitService;

    public RecruitController(RecruitService recruitService) {
        this.recruitService = recruitService;
    }

    @GetMapping
    public List<RecruitResponse> list(
            @RequestParam(required = false) String query, @RequestParam(required = false) String hireType) {
        return recruitService.list(query, hireType).stream().map(RecruitResponse::from).toList();
    }

    @PostMapping("/sync")
    public RecruitSyncResponse sync() {
        return recruitService.sync();
    }
}
