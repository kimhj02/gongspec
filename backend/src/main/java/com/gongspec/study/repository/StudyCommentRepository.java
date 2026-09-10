package com.gongspec.study.repository;

import com.gongspec.study.entity.StudyComment;
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

    void deleteByPostId(UUID postId);
}
