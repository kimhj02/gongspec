package com.gongspec.user.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.gongspec.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findsUserByKakaoId() {
        userRepository.save(new User("kakao-1", "현진", "user@example.com"));

        assertThat(userRepository.findByKakaoId("kakao-1"))
                .isPresent()
                .get()
                .extracting(User::getNickname, User::getEmail)
                .containsExactly("현진", "user@example.com");
        assertThat(userRepository.existsByKakaoId("missing")).isFalse();
    }
}
