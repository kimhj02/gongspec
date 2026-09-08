package com.gongspec.schedule.repository;

import com.gongspec.schedule.entity.Schedule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    List<Schedule> findByUserIdOrderByDateAscTitleAsc(UUID userId);

    Optional<Schedule> findByIdAndUserId(UUID id, UUID userId);
}
