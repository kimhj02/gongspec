package com.gongspec.study.dto;

import com.gongspec.study.entity.StudyComment;
import java.time.Instant;
import java.util.UUID;

/** 댓글 본문·작성자 정보와 현재 사용자의 댓글인지 여부를 반환한다. */
public record StudyCommentResponse(
        String id, String body, String authorId, String authorNickname, boolean mine, Instant createdAt) {

    public static StudyCommentResponse from(StudyComment comment, UUID viewerId) {
        return new StudyCommentResponse(
                comment.getId().toString(),
                comment.getBody(),
                comment.getAuthor().getId().toString(),
                comment.getAuthor().displayNickname(),
                comment.getAuthor().getId().equals(viewerId),
                comment.getCreatedAt());
    }
}
