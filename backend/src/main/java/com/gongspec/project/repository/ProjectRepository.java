package com.gongspec.project.repository;

import com.gongspec.project.entity.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 프로젝트의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByUserId(UUID userId);

    Optional<Project> findByIdAndUserId(UUID id, UUID userId);
}
