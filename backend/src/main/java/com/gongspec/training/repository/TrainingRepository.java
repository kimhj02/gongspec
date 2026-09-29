package com.gongspec.training.repository;

import com.gongspec.training.entity.Training;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 직업교육의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface TrainingRepository extends JpaRepository<Training, UUID> {
    List<Training> findByUserId(UUID userId);

    Optional<Training> findByIdAndUserId(UUID id, UUID userId);
}
