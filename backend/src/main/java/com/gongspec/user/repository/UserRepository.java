package com.gongspec.user.repository;

import com.gongspec.user.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 카카오 ID로 사용자를 조회하고 대소문자를 무시한 사이트 닉네임 중복 여부를 확인한다. */
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByKakaoId(String kakaoId);

    boolean existsByKakaoId(String kakaoId);

    boolean existsBySiteNicknameIgnoreCase(String siteNickname);

    boolean existsBySiteNicknameIgnoreCaseAndIdNot(String siteNickname, UUID id);
}
