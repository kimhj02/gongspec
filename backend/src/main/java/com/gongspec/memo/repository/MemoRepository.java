package com.gongspec.memo.repository;

import com.gongspec.memo.entity.Memo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 메모의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface MemoRepository extends JpaRepository<Memo, UUID> {
    List<Memo> findByUserId(UUID userId);

    Optional<Memo> findByIdAndUserId(UUID id, UUID userId);
}
