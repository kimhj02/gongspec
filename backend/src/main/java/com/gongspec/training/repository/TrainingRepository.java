package com.gongspec.training.repository;

import com.gongspec.training.entity.Training;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingRepository extends JpaRepository<Training, UUID> {
    List<Training> findByUserId(UUID userId);

    Optional<Training> findByIdAndUserId(UUID id, UUID userId);
}
