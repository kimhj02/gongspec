package com.gongspec.study.entity;

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
import java.util.UUID;

@Entity
@Table(name = "study_posts")
public class StudyPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 120)
    private String institution;

    private UUID recruitId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudyPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudyMode mode;

    @Column(length = 80)
    private String region;

    private Integer capacity;

    @Column(length = 200)
    private String scheduleText;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudyStatus status = StudyStatus.OPEN;

    @Column(nullable = false)
    private boolean hidden;

    protected StudyPost() {}

    public StudyPost(User author) {
        this.author = author;
        this.status = StudyStatus.OPEN;
        this.hidden = false;
    }

    public void replace(
            String title,
            String institution,
            UUID recruitId,
            StudyPurpose purpose,
            StudyMode mode,
            String region,
            Integer capacity,
            String scheduleText,
            String body) {
        this.title = title;
        this.institution = institution;
        this.recruitId = recruitId;
        this.purpose = purpose;
        this.mode = mode;
        this.region = blankToNull(region);
        this.capacity = capacity;
        this.scheduleText = blankToNull(scheduleText);
        this.body = blankToNull(body);
    }

    public void close() {
        this.status = StudyStatus.CLOSED;
    }

    public void open() {
        this.status = StudyStatus.OPEN;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public User getAuthor() {
        return author;
    }

    public String getTitle() {
        return title;
    }

    public String getInstitution() {
        return institution;
    }

    public UUID getRecruitId() {
        return recruitId;
    }

    public StudyPurpose getPurpose() {
        return purpose;
    }

    public StudyMode getMode() {
        return mode;
    }

    public String getRegion() {
        return region;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getScheduleText() {
        return scheduleText;
    }

    public String getBody() {
        return body;
    }

    public StudyStatus getStatus() {
        return status;
    }

    public boolean isHidden() {
        return hidden;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
