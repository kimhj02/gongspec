package com.gongspec.study.repository;

import com.gongspec.study.entity.StudyComment;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudyCommentRepository extends JpaRepository<StudyComment, UUID> {

    @Query(
            """
            select c from StudyComment c
            join fetch c.author
            where c.post.id = :postId and c.hidden = false
            order by c.createdAt asc
            """)
    List<StudyComment> findVisibleByPostId(@Param("postId") UUID postId);

    long countByPostIdAndHiddenFalse(UUID postId);

    @Query(
            """
            select c.post.id as postId, count(c) as commentCount
            from StudyComment c
            where c.hidden = false and c.post.id in :postIds
            group by c.post.id
            """)
    List<CommentCount> countVisibleByPostIds(@Param("postIds") Collection<UUID> postIds);

    @Query(
            """
            select c from StudyComment c
            join fetch c.post
            where c.id in :ids
            """)
    List<StudyComment> findAllWithPostByIdIn(@Param("ids") Collection<UUID> ids);

    void deleteByPostId(UUID postId);

    interface CommentCount {
        UUID getPostId();

        long getCommentCount();
    }
}
