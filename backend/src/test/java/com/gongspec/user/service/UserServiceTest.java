package com.gongspec.user.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.gongspec.user.entity.User;
import com.gongspec.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(UserService.class)
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void upsertsKakaoUser() {
        User created = userService.upsertFromKakao("kakao-1", "현진", "a@example.com");
        User updated = userService.upsertFromKakao("kakao-1", "공스펙", "b@example.com");

        assertThat(created.getId()).isEqualTo(updated.getId());
        assertThat(updated.getNickname()).isEqualTo("공스펙");
        assertThat(updated.getEmail()).isEqualTo("b@example.com");
        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void keepsEmailWhenKakaoOmitsIt() {
        userService.upsertFromKakao("kakao-1", "현진", "kept@example.com");
        User updated = userService.upsertFromKakao("kakao-1", "현진", null);

        assertThat(updated.getEmail()).isEqualTo("kept@example.com");
    }
}
