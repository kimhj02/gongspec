package com.gongspec.user.repository;

import com.gongspec.user.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByKakaoId(String kakaoId);

    boolean existsByKakaoId(String kakaoId);

    boolean existsBySiteNicknameIgnoreCase(String siteNickname);

    boolean existsBySiteNicknameIgnoreCaseAndIdNot(String siteNickname, UUID id);
}
