package com.gongspec.schedule.service;

import com.gongspec.common.exception.ApiException;
import com.gongspec.schedule.dto.ScheduleRequest;
import com.gongspec.schedule.entity.Schedule;
import com.gongspec.schedule.repository.ScheduleRepository;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserService userService;

    public ScheduleService(ScheduleRepository scheduleRepository, UserService userService) {
        this.scheduleRepository = scheduleRepository;
        this.userService = userService;
    }

    public List<Schedule> list(UUID userId) {
        return scheduleRepository.findByUserIdOrderByDateAscTitleAsc(userId);
    }

    @Transactional
    public Schedule create(UUID userId, ScheduleRequest request) {
        User user = userService.getById(userId);
        return scheduleRepository.save(new Schedule(
                user, request.title(), request.date(), request.endDate(), request.memo(), request.type()));
    }

    @Transactional
    public Schedule replace(UUID userId, UUID id, ScheduleRequest request) {
        Schedule schedule = getOwned(userId, id);
        schedule.replace(request.title(), request.date(), request.endDate(), request.memo(), request.type());
        return schedule;
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        scheduleRepository.delete(getOwned(userId, id));
    }

    private Schedule getOwned(UUID userId, UUID id) {
        return scheduleRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("일정을 찾을 수 없습니다."));
    }
}
