package com.gongspec.certificate.repository;

import com.gongspec.certificate.entity.Certificate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 자격증의 사용자별 목록과 ID·소유자가 일치하는 자료를 조회하는 JPA 저장소이다. */
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    List<Certificate> findByUserId(UUID userId);

    Optional<Certificate> findByIdAndUserId(UUID id, UUID userId);
}
