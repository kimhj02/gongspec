package com.gongspec.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.gongspec.common.config.AppProperties;
import com.gongspec.common.exception.ApiException;
import com.gongspec.user.entity.User;
import com.gongspec.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import({UserService.class, UserServiceTest.Config.class})
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @TestConfiguration
    static class Config {
        @Bean
        AppProperties appProperties() {
            return new AppProperties(null, null, new AppProperties.Admin("admin-kakao"));
        }
    }

    @Test
    void upsertsKakaoUser() {
        User created = userService.upsertFromKakao("kakao-1", "현진", "a@example.com");
        User updated = userService.upsertFromKakao("kakao-1", "공스펙", "b@example.com");

        assertThat(created.getId()).isEqualTo(updated.getId());
        assertThat(updated.getNickname()).isEqualTo("공스펙");
        assertThat(updated.getEmail()).isEqualTo("b@example.com");
        assertThat(updated.needsNickname()).isTrue();
        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void keepsEmailWhenKakaoOmitsIt() {
        userService.upsertFromKakao("kakao-1", "현진", "kept@example.com");
        User updated = userService.upsertFromKakao("kakao-1", "현진", null);

        assertThat(updated.getEmail()).isEqualTo("kept@example.com");
    }

    @Test
    void marksConfiguredKakaoIdAsAdmin() {
        User admin = userService.upsertFromKakao("admin-kakao", "관리", null);
        User member = userService.upsertFromKakao("kakao-1", "현진", null);

        assertThat(admin.isAdmin()).isTrue();
        assertThat(member.isAdmin()).isFalse();
    }

    @Test
    void setsAUniqueSiteNickname() {
        User user = userService.upsertFromKakao("kakao-1", "현진", null);
        User saved = userService.setSiteNickname(user.getId(), " 공스펙 ");

        assertThat(saved.displayNickname()).isEqualTo("공스펙");
        assertThat(saved.needsNickname()).isFalse();
    }

    @Test
    void rejectsDuplicateSiteNickname() {
        User first = userService.upsertFromKakao("kakao-1", "현진", null);
        userService.setSiteNickname(first.getId(), "공스펙");
        User second = userService.upsertFromKakao("kakao-2", "다른", null);

        assertThatThrownBy(() -> userService.setSiteNickname(second.getId(), "공스펙"))
                .isInstanceOf(ApiException.class)
                .hasMessage("이미 쓰는 닉네임입니다.");
    }
}
