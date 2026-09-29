package com.gongspec.essay.repository;

import com.gongspec.essay.entity.Essay;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 자기소개서의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface EssayRepository extends JpaRepository<Essay, UUID> {
    List<Essay> findByUserId(UUID userId);

    Optional<Essay> findByIdAndUserId(UUID id, UUID userId);
}
