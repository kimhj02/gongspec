package com.gongspec.application.repository;

import com.gongspec.application.entity.JobApplication;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByUserId(UUID userId);

    Optional<JobApplication> findByIdAndUserId(UUID id, UUID userId);
}
