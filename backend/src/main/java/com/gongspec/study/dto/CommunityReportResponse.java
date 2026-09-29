package com.gongspec.study.dto;

import com.gongspec.study.entity.CommunityReport;
import com.gongspec.study.entity.ReportTargetType;
import java.time.Instant;

/** 신고 정보에 대상 글 제목·댓글 본문·숨김 상태를 합쳐 관리자 화면에 전달한다. */
public record CommunityReportResponse(
        String id,
        ReportTargetType targetType,
        String targetId,
        String reason,
        String reporterNickname,
        String postTitle,
        String commentBody,
        boolean hidden,
        Instant createdAt) {

    public static CommunityReportResponse from(
            CommunityReport report, String postTitle, String commentBody, boolean hidden) {
        return new CommunityReportResponse(
                report.getId().toString(),
                report.getTargetType(),
                report.getTargetId().toString(),
                report.getReason(),
                report.getReporter().displayNickname(),
                postTitle,
                commentBody,
                hidden,
                report.getCreatedAt());
    }
}
