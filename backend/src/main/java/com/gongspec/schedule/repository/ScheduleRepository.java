package com.gongspec.schedule.repository;

import com.gongspec.schedule.entity.Schedule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 사용자별 일정을 날짜·제목순으로 조회하고 소유자와 일정 ID를 함께 확인한다. */
public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    List<Schedule> findByUserIdOrderByDateAscTitleAsc(UUID userId);

    Optional<Schedule> findByIdAndUserId(UUID id, UUID userId);
}
