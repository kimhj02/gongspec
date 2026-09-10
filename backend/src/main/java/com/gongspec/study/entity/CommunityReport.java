package com.gongspec.study.entity;

import com.gongspec.common.entity.BaseEntity;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;

@Entity
@Table(
        name = "community_reports",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_community_reports_reporter_target",
                        columnNames = {"reporter_id", "target_type", "target_id"}))
public class CommunityReport extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportTargetType targetType;

    @Column(nullable = false)
    private UUID targetId;

    @Column(nullable = false, length = 300)
    private String reason;

    protected CommunityReport() {}

    public CommunityReport(User reporter, ReportTargetType targetType, UUID targetId, String reason) {
        this.reporter = reporter;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
    }

    public User getReporter() {
        return reporter;
    }

    public ReportTargetType getTargetType() {
        return targetType;
    }

    public UUID getTargetId() {
        return targetId;
    }

    public String getReason() {
        return reason;
    }
}
