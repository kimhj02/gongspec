package com.gongspec.user.service;

import com.gongspec.common.config.AppProperties;
import com.gongspec.common.exception.ApiException;
import com.gongspec.user.entity.User;
import com.gongspec.user.repository.UserRepository;
import com.gongspec.user.support.SiteNickname;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 카카오 사용자 갱신, 사이트 닉네임 중복 검증, 관리자·닉네임 설정 여부 확인을 담당한다. */
@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final AppProperties appProperties;

    public UserService(UserRepository userRepository, AppProperties appProperties) {
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    public Optional<User> findByKakaoId(String kakaoId) {
        return userRepository.findByKakaoId(kakaoId);
    }

    public User getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("사용자를 찾을 수 없습니다."));
    }

    public User requireAdmin(UUID id) {
        User user = getById(id);
        if (!user.isAdmin()) {
            throw ApiException.forbidden("관리자만 볼 수 있습니다.");
        }
        return user;
    }

    public User requireNickname(UUID id) {
        User user = getById(id);
        if (user.needsNickname()) {
            throw ApiException.badRequest("닉네임을 먼저 정해 주세요.");
        }
        return user;
    }

    @Transactional
    public User upsertFromKakao(String kakaoId, String nickname, String email) {
        User user = userRepository
                .findByKakaoId(kakaoId)
                .map(existing -> {
                    existing.updateProfile(nickname, email);
                    return existing;
                })
                .orElseGet(() -> userRepository.save(new User(kakaoId, nickname, email)));
        // 관리자 여부는 로그인 시 서버 설정 목록으로 갱신한다. 클라이언트가 지정하는 값은 사용하지 않는다.
        user.setAdmin(appProperties.admin().includes(kakaoId));
        return user;
    }

    @Transactional
    public User setSiteNickname(UUID userId, String rawNickname) {
        String nickname = SiteNickname.normalize(rawNickname);
        User user = getById(userId);
        boolean taken = user.needsNickname()
                ? userRepository.existsBySiteNicknameIgnoreCase(nickname)
                : userRepository.existsBySiteNicknameIgnoreCaseAndIdNot(nickname, userId);
        if (taken) {
            throw ApiException.badRequest("이미 쓰는 닉네임입니다.");
        }
        user.setSiteNickname(nickname);
        // 사전 조회 이후 발생할 수 있는 동시 닉네임 등록 경쟁도 DB 제약으로 확인한다.
        try {
            userRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw ApiException.badRequest("이미 쓰는 닉네임입니다.");
        }
        return user;
    }
}
