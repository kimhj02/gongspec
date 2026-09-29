package com.gongspec.career.repository;

import com.gongspec.career.entity.Career;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 경력의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface CareerRepository extends JpaRepository<Career, UUID> {
    List<Career> findByUserId(UUID userId);

    Optional<Career> findByIdAndUserId(UUID id, UUID userId);
}
