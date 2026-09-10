package com.gongspec.admin.controller;

import com.gongspec.auth.CurrentUser;
import com.gongspec.study.dto.CommunityReportResponse;
import com.gongspec.study.service.StudyService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StudyService studyService;

    public AdminController(StudyService studyService) {
        this.studyService = studyService;
    }

    @GetMapping("/reports")
    public List<CommunityReportResponse> reports() {
        return studyService.listReports(CurrentUser.id());
    }

    @PostMapping("/posts/{id}/hide")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void hidePost(@PathVariable UUID id) {
        studyService.hidePost(CurrentUser.id(), id, true);
    }

    @PostMapping("/posts/{id}/unhide")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unhidePost(@PathVariable UUID id) {
        studyService.hidePost(CurrentUser.id(), id, false);
    }

    @PostMapping("/comments/{id}/hide")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void hideComment(@PathVariable UUID id) {
        studyService.hideComment(CurrentUser.id(), id, true);
    }

    @PostMapping("/comments/{id}/unhide")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unhideComment(@PathVariable UUID id) {
        studyService.hideComment(CurrentUser.id(), id, false);
    }
}
