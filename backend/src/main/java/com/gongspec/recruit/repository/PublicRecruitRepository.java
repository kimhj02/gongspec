package com.gongspec.recruit.repository;

import com.gongspec.recruit.entity.PublicRecruit;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PublicRecruitRepository extends JpaRepository<PublicRecruit, java.util.UUID> {

    Optional<PublicRecruit> findByRecrutPblntSn(Long recrutPblntSn);

    List<PublicRecruit> findByOngoingTrue();

    @Query(
            """
            select r from PublicRecruit r
            where r.ongoing = true
              and (:hireType is null or :hireType = '' or r.hireTypes like concat('%', :hireType, '%'))
              and (
                    :query is null or :query = ''
                    or lower(r.instNm) like lower(concat('%', :query, '%'))
                    or lower(r.title) like lower(concat('%', :query, '%'))
                  )
            order by coalesce(r.pbancEndYmd, '9999-99-99') asc, r.instNm asc, r.title asc
            """)
    List<PublicRecruit> searchOngoing(@Param("hireType") String hireType, @Param("query") String query);
}
