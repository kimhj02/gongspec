package com.gongspec.study.controller;

import com.gongspec.auth.CurrentUser;
import com.gongspec.study.dto.StudyCommentRequest;
import com.gongspec.study.dto.StudyCommentResponse;
import com.gongspec.study.dto.StudyPostRequest;
import com.gongspec.study.dto.StudyPostResponse;
import com.gongspec.study.dto.StudyReportRequest;
import com.gongspec.study.entity.StudyPurpose;
import com.gongspec.study.entity.StudyStatus;
import com.gongspec.study.service.StudyService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study")
public class StudyController {

    private final StudyService studyService;

    public StudyController(StudyService studyService) {
        this.studyService = studyService;
    }

    @GetMapping("/posts")
    public List<StudyPostResponse> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String purpose,
            @RequestParam(required = false) String status) {
        return studyService.list(
                CurrentUser.id(),
                query,
                purpose == null || purpose.isBlank() ? null : StudyPurpose.from(purpose),
                status == null || status.isBlank() ? null : StudyStatus.from(status));
    }

    @GetMapping("/posts/{id}")
    public StudyPostResponse get(@PathVariable UUID id) {
        return studyService.getVisible(CurrentUser.id(), id);
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public StudyPostResponse create(@Valid @RequestBody StudyPostRequest request) {
        return studyService.create(CurrentUser.id(), request);
    }

    @PutMapping("/posts/{id}")
    public StudyPostResponse replace(@PathVariable UUID id, @Valid @RequestBody StudyPostRequest request) {
        return studyService.replace(CurrentUser.id(), id, request);
    }

    @PostMapping("/posts/{id}/close")
    public StudyPostResponse close(@PathVariable UUID id) {
        return studyService.close(CurrentUser.id(), id);
    }

    @PostMapping("/posts/{id}/open")
    public StudyPostResponse open(@PathVariable UUID id) {
        return studyService.open(CurrentUser.id(), id);
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        studyService.delete(CurrentUser.id(), id);
    }

    @GetMapping("/posts/{id}/comments")
    public List<StudyCommentResponse> comments(@PathVariable UUID id) {
        return studyService.comments(CurrentUser.id(), id);
    }

    @PostMapping("/posts/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public StudyCommentResponse addComment(@PathVariable UUID id, @Valid @RequestBody StudyCommentRequest request) {
        return studyService.addComment(CurrentUser.id(), id, request);
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable UUID id) {
        studyService.deleteComment(CurrentUser.id(), id);
    }

    @PostMapping("/posts/{id}/reports")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reportPost(@PathVariable UUID id, @Valid @RequestBody StudyReportRequest request) {
        studyService.reportPost(CurrentUser.id(), id, request);
    }

    @PostMapping("/comments/{id}/reports")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reportComment(@PathVariable UUID id, @Valid @RequestBody StudyReportRequest request) {
        studyService.reportComment(CurrentUser.id(), id, request);
    }
}
