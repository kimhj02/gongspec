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
        try {
            userRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw ApiException.badRequest("이미 쓰는 닉네임입니다.");
        }
        return user;
    }
}
