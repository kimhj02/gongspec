package com.gongspec.study.repository;

import com.gongspec.study.entity.StudyPost;
import com.gongspec.study.entity.StudyPurpose;
import com.gongspec.study.entity.StudyStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudyPostRepository extends JpaRepository<StudyPost, UUID> {

    @Query(
            """
            select p from StudyPost p
            join fetch p.author
            where p.hidden = false
              and (:status is null or p.status = :status)
              and (:purpose is null or p.purpose = :purpose)
              and (
                    :query is null or :query = ''
                    or lower(p.title) like lower(concat('%', :query, '%'))
                    or lower(p.institution) like lower(concat('%', :query, '%'))
                    or lower(p.body) like lower(concat('%', :query, '%'))
                  )
            order by case when p.status = com.gongspec.study.entity.StudyStatus.OPEN then 0 else 1 end, p.createdAt desc
            """)
    List<StudyPost> searchVisible(
            @Param("query") String query, @Param("purpose") StudyPurpose purpose, @Param("status") StudyStatus status);
}
