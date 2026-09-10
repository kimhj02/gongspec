package com.gongspec.study.dto;

import com.gongspec.recruit.entity.PublicRecruit;
import com.gongspec.study.entity.StudyMode;
import com.gongspec.study.entity.StudyPost;
import com.gongspec.study.entity.StudyPurpose;
import com.gongspec.study.entity.StudyStatus;
import java.time.Instant;
import java.util.UUID;

public record StudyPostResponse(
        String id,
        String title,
        String institution,
        String recruitId,
        String recruitTitle,
        StudyPurpose purpose,
        StudyMode mode,
        String region,
        Integer capacity,
        String scheduleText,
        String body,
        StudyStatus status,
        String authorId,
        String authorNickname,
        boolean mine,
        long commentCount,
        Instant createdAt) {

    public static StudyPostResponse from(StudyPost post, UUID viewerId, long commentCount, PublicRecruit recruit) {
        return new StudyPostResponse(
                post.getId().toString(),
                post.getTitle(),
                post.getInstitution(),
                post.getRecruitId() == null ? null : post.getRecruitId().toString(),
                recruit == null ? null : recruit.getTitle(),
                post.getPurpose(),
                post.getMode(),
                post.getRegion(),
                post.getCapacity(),
                post.getScheduleText(),
                post.getBody(),
                post.getStatus(),
                post.getAuthor().getId().toString(),
                post.getAuthor().displayNickname(),
                post.getAuthor().getId().equals(viewerId),
                commentCount,
                post.getCreatedAt());
    }
}
