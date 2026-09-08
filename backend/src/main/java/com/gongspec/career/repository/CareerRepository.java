package com.gongspec.career.repository;

import com.gongspec.career.entity.Career;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareerRepository extends JpaRepository<Career, UUID> {
    List<Career> findByUserIdOrderByPinnedDescCreatedAtDesc(UUID userId);

    Optional<Career> findByIdAndUserId(UUID id, UUID userId);
}
