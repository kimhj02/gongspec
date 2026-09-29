package com.gongspec.application.repository;

import com.gongspec.application.entity.JobApplication;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 지원 현황의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByUserId(UUID userId);

    Optional<JobApplication> findByIdAndUserId(UUID id, UUID userId);
}
