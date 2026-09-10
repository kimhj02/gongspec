package com.gongspec.study.repository;

import com.gongspec.study.entity.CommunityReport;
import com.gongspec.study.entity.ReportTargetType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommunityReportRepository extends JpaRepository<CommunityReport, UUID> {

    boolean existsByReporterIdAndTargetTypeAndTargetId(UUID reporterId, ReportTargetType targetType, UUID targetId);

    @Query(
            """
            select r from CommunityReport r
            join fetch r.reporter
            order by r.createdAt desc
            """)
    List<CommunityReport> findAllWithReporter();
}
