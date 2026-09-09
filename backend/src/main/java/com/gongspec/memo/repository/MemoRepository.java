package com.gongspec.memo.repository;

import com.gongspec.memo.entity.Memo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemoRepository extends JpaRepository<Memo, UUID> {
    List<Memo> findByUserId(UUID userId);

    Optional<Memo> findByIdAndUserId(UUID id, UUID userId);
}
