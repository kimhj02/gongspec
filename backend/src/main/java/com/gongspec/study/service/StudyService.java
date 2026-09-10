package com.gongspec.study.service;

import com.gongspec.common.exception.ApiException;
import com.gongspec.common.support.ContactGuard;
import com.gongspec.recruit.entity.PublicRecruit;
import com.gongspec.recruit.repository.PublicRecruitRepository;
import com.gongspec.study.dto.CommunityReportResponse;
import com.gongspec.study.dto.StudyCommentRequest;
import com.gongspec.study.dto.StudyCommentResponse;
import com.gongspec.study.dto.StudyPostRequest;
import com.gongspec.study.dto.StudyPostResponse;
import com.gongspec.study.dto.StudyReportRequest;
import com.gongspec.study.entity.CommunityReport;
import com.gongspec.study.entity.ReportTargetType;
import com.gongspec.study.entity.StudyComment;
import com.gongspec.study.entity.StudyPost;
import com.gongspec.study.entity.StudyPurpose;
import com.gongspec.study.entity.StudyStatus;
import com.gongspec.study.repository.CommunityReportRepository;
import com.gongspec.study.repository.StudyCommentRepository;
import com.gongspec.study.repository.StudyPostRepository;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StudyService {

    private final StudyPostRepository postRepository;
    private final StudyCommentRepository commentRepository;
    private final CommunityReportRepository reportRepository;
    private final PublicRecruitRepository recruitRepository;
    private final UserService userService;

    public StudyService(
            StudyPostRepository postRepository,
            StudyCommentRepository commentRepository,
            CommunityReportRepository reportRepository,
            PublicRecruitRepository recruitRepository,
            UserService userService) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.recruitRepository = recruitRepository;
        this.userService = userService;
    }

    public List<StudyPostResponse> list(UUID viewerId, String query, StudyPurpose purpose, StudyStatus status) {
        List<StudyPost> posts = postRepository.searchVisible(blankToNull(query), purpose, status);
        if (posts.isEmpty()) {
            return List.of();
        }
        List<UUID> postIds = posts.stream().map(StudyPost::getId).toList();
        Map<UUID, Long> commentCounts = new HashMap<>();
        for (StudyCommentRepository.CommentCount row : commentRepository.countVisibleByPostIds(postIds)) {
            commentCounts.put(row.getPostId(), row.getCommentCount());
        }
        List<UUID> recruitIds = posts.stream().map(StudyPost::getRecruitId).filter(Objects::nonNull).distinct().toList();
        Map<UUID, PublicRecruit> recruits = recruitIds.isEmpty()
                ? Map.of()
                : recruitRepository.findAllById(recruitIds).stream()
                        .collect(Collectors.toMap(PublicRecruit::getId, Function.identity()));
        return posts.stream()
                .map(post -> StudyPostResponse.from(
                        post,
                        viewerId,
                        commentCounts.getOrDefault(post.getId(), 0L),
                        post.getRecruitId() == null ? null : recruits.get(post.getRecruitId())))
                .toList();
    }

    public StudyPostResponse getVisible(UUID viewerId, UUID id) {
        return toResponse(getVisiblePost(id), viewerId);
    }

    @Transactional
    public StudyPostResponse create(UUID userId, StudyPostRequest request) {
        User author = userService.requireNickname(userId);
        StudyPost post = new StudyPost(author);
        apply(post, request);
        return toResponse(postRepository.save(post), userId);
    }

    @Transactional
    public StudyPostResponse replace(UUID userId, UUID id, StudyPostRequest request) {
        StudyPost post = getOwnedPost(userId, id);
        apply(post, request);
        return toResponse(post, userId);
    }

    @Transactional
    public StudyPostResponse close(UUID userId, UUID id) {
        StudyPost post = getOwnedPost(userId, id);
        post.close();
        return toResponse(post, userId);
    }

    @Transactional
    public StudyPostResponse open(UUID userId, UUID id) {
        StudyPost post = getOwnedPost(userId, id);
        post.open();
        return toResponse(post, userId);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        StudyPost post = getOwnedPost(userId, id);
        commentRepository.deleteByPostId(post.getId());
        postRepository.delete(post);
    }

    public List<StudyCommentResponse> comments(UUID viewerId, UUID postId) {
        getVisiblePost(postId);
        return commentRepository.findVisibleByPostId(postId).stream()
                .map(comment -> StudyCommentResponse.from(comment, viewerId))
                .toList();
    }

    @Transactional
    public StudyCommentResponse addComment(UUID userId, UUID postId, StudyCommentRequest request) {
        User author = userService.requireNickname(userId);
        StudyPost post = getVisiblePost(postId);
        ContactGuard.rejectIfPresent(request.body());
        StudyComment comment = commentRepository.save(new StudyComment(post, author, request.body().trim()));
        return StudyCommentResponse.from(comment, userId);
    }

    @Transactional
    public void deleteComment(UUID userId, UUID commentId) {
        StudyComment comment = commentRepository
                .findById(commentId)
                .orElseThrow(() -> ApiException.notFound("댓글을 찾을 수 없습니다."));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw ApiException.forbidden("본인 댓글만 지울 수 있습니다.");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public void reportPost(UUID userId, UUID postId, StudyReportRequest request) {
        getVisiblePost(postId);
        saveReport(userId, ReportTargetType.POST, postId, request.reason());
    }

    @Transactional
    public void reportComment(UUID userId, UUID commentId, StudyReportRequest request) {
        StudyComment comment = commentRepository
                .findById(commentId)
                .filter(item -> !item.isHidden())
                .orElseThrow(() -> ApiException.notFound("댓글을 찾을 수 없습니다."));
        saveReport(userId, ReportTargetType.COMMENT, comment.getId(), request.reason());
    }

    public List<CommunityReportResponse> listReports(UUID adminId) {
        userService.requireAdmin(adminId);
        List<CommunityReport> reports = reportRepository.findAllWithReporter();
        Map<UUID, StudyPost> posts = postRepository.findAllById(reportIds(reports, ReportTargetType.POST)).stream()
                .collect(Collectors.toMap(StudyPost::getId, Function.identity()));
        Map<UUID, StudyComment> comments;
        List<UUID> commentIds = reportIds(reports, ReportTargetType.COMMENT);
        if (commentIds.isEmpty()) {
            comments = Map.of();
        } else {
            comments = commentRepository.findAllWithPostByIdIn(commentIds).stream()
                    .collect(Collectors.toMap(StudyComment::getId, Function.identity()));
        }
        return reports.stream()
                .map(report -> toReportResponse(report, posts, comments))
                .toList();
    }

    @Transactional
    public void hidePost(UUID adminId, UUID postId, boolean hidden) {
        userService.requireAdmin(adminId);
        StudyPost post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("글을 찾을 수 없습니다."));
        post.setHidden(hidden);
    }

    @Transactional
    public void hideComment(UUID adminId, UUID commentId, boolean hidden) {
        userService.requireAdmin(adminId);
        StudyComment comment = commentRepository
                .findById(commentId)
                .orElseThrow(() -> ApiException.notFound("댓글을 찾을 수 없습니다."));
        comment.setHidden(hidden);
    }

    private void apply(StudyPost post, StudyPostRequest request) {
        ContactGuard.rejectIfPresent(
                request.title(),
                request.institution(),
                request.region(),
                request.scheduleText(),
                request.body());
        Integer capacity = request.capacity();
        if (capacity != null && (capacity < 1 || capacity > 99)) {
            throw ApiException.badRequest("모집 인원은 1~99명으로 적어 주세요.");
        }
        post.replace(
                request.title().trim(),
                request.institution(),
                parseRecruitId(request.recruitId()),
                request.purpose(),
                request.mode(),
                request.region(),
                capacity,
                request.scheduleText(),
                request.body());
    }

    private UUID parseRecruitId(String recruitId) {
        if (recruitId == null || recruitId.isBlank()) {
            return null;
        }
        UUID id;
        try {
            id = UUID.fromString(recruitId.trim());
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("연결된 공고를 확인해 주세요.");
        }
        if (!recruitRepository.existsById(id)) {
            throw ApiException.badRequest("연결된 공고를 찾을 수 없습니다.");
        }
        return id;
    }

    private StudyPostResponse toResponse(StudyPost post, UUID viewerId) {
        PublicRecruit recruit =
                post.getRecruitId() == null ? null : recruitRepository.findById(post.getRecruitId()).orElse(null);
        return StudyPostResponse.from(
                post, viewerId, commentRepository.countByPostIdAndHiddenFalse(post.getId()), recruit);
    }

    private StudyPost getVisiblePost(UUID id) {
        StudyPost post = postRepository.findById(id).orElseThrow(() -> ApiException.notFound("글을 찾을 수 없습니다."));
        if (post.isHidden()) {
            throw ApiException.notFound("글을 찾을 수 없습니다.");
        }
        return post;
    }

    private StudyPost getOwnedPost(UUID userId, UUID id) {
        userService.requireNickname(userId);
        StudyPost post = postRepository.findById(id).orElseThrow(() -> ApiException.notFound("글을 찾을 수 없습니다."));
        if (!post.getAuthor().getId().equals(userId)) {
            throw ApiException.forbidden("본인 글만 바꿀 수 있습니다.");
        }
        return post;
    }

    private void saveReport(UUID userId, ReportTargetType type, UUID targetId, String reason) {
        User reporter = userService.requireNickname(userId);
        ContactGuard.rejectIfPresent(reason);
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(userId, type, targetId)) {
            throw ApiException.badRequest("이미 신고한 내용입니다.");
        }
        try {
            reportRepository.saveAndFlush(new CommunityReport(reporter, type, targetId, reason.trim()));
        } catch (DataIntegrityViolationException exception) {
            throw ApiException.badRequest("이미 신고한 내용입니다.");
        }
    }

    private static List<UUID> reportIds(List<CommunityReport> reports, ReportTargetType type) {
        return reports.stream().filter(report -> report.getTargetType() == type).map(CommunityReport::getTargetId).toList();
    }

    private static CommunityReportResponse toReportResponse(
            CommunityReport report, Map<UUID, StudyPost> posts, Map<UUID, StudyComment> comments) {
        if (report.getTargetType() == ReportTargetType.POST) {
            StudyPost post = posts.get(report.getTargetId());
            return CommunityReportResponse.from(
                    report, post == null ? "삭제된 글" : post.getTitle(), null, post != null && post.isHidden());
        }
        StudyComment comment = comments.get(report.getTargetId());
        String postTitle = comment == null ? "삭제된 댓글" : comment.getPost().getTitle();
        String body = comment == null ? null : comment.getBody();
        return CommunityReportResponse.from(report, postTitle, body, comment != null && comment.isHidden());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
