package com.gongspec.user.service;

import com.gongspec.common.exception.ApiException;
import com.gongspec.user.entity.User;
import com.gongspec.user.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByKakaoId(String kakaoId) {
        return userRepository.findByKakaoId(kakaoId);
    }

    public User getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public User upsertFromKakao(String kakaoId, String nickname, String email) {
        return userRepository.findByKakaoId(kakaoId)
                .map(user -> {
                    user.updateProfile(nickname, email);
                    return user;
                })
                .orElseGet(() -> userRepository.save(new User(kakaoId, nickname, email)));
    }
}
