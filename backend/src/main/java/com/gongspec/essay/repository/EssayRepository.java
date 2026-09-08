package com.gongspec.essay.repository;

import com.gongspec.essay.entity.Essay;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EssayRepository extends JpaRepository<Essay, UUID> {
    List<Essay> findByUserIdOrderByPinnedDescCreatedAtDesc(UUID userId);

    Optional<Essay> findByIdAndUserId(UUID id, UUID userId);
}
