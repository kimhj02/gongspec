package com.gongspec.resource.repository;

import com.gongspec.resource.entity.Resource;
import com.gongspec.resource.entity.ResourceTab;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    List<Resource> findByUserIdOrderByPinnedDescCreatedAtDesc(UUID userId);

    List<Resource> findByUserIdAndTabOrderByPinnedDescCreatedAtDesc(UUID userId, ResourceTab tab);

    Optional<Resource> findByIdAndUserId(UUID id, UUID userId);
}
