package com.gongspec.schedule.entity;

import com.gongspec.common.entity.BaseEntity;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "schedules")
public class Schedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 10)
    private String date;

    @Column(length = 10)
    private String endDate;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleType type;

    protected Schedule() {}

    public Schedule(User user, String title, String date, String endDate, String memo, ScheduleType type) {
        this.user = user;
        replace(title, date, endDate, memo, type);
    }

    public void replace(String title, String date, String endDate, String memo, ScheduleType type) {
        this.title = title;
        this.date = date;
        this.endDate = blankToNull(endDate);
        this.memo = blankToNull(memo);
        this.type = type;
    }

    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getDate() {
        return date;
    }

    public String getEndDate() {
        return endDate;
    }

    public String getMemo() {
        return memo;
    }

    public ScheduleType getType() {
        return type;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
