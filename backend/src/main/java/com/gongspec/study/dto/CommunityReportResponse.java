package com.gongspec.study.dto;

import com.gongspec.study.entity.CommunityReport;
import com.gongspec.study.entity.ReportTargetType;
import java.time.Instant;

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
