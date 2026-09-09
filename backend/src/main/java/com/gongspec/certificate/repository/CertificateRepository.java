package com.gongspec.certificate.repository;

import com.gongspec.certificate.entity.Certificate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    List<Certificate> findByUserId(UUID userId);

    Optional<Certificate> findByIdAndUserId(UUID id, UUID userId);
}
