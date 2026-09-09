package com.gongspec.site.repository;

import com.gongspec.site.entity.Site;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteRepository extends JpaRepository<Site, UUID> {
    List<Site> findByUserId(UUID userId);

    Optional<Site> findByIdAndUserId(UUID id, UUID userId);
}
