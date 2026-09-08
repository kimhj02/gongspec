package com.gongspec.auth.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private final JwtTokenProvider provider =
            new JwtTokenProvider(new JwtProperties("gongspec-test-jwt-secret-key-32bytes", Duration.ofHours(1)));

    @Test
    void createsAndParsesUserId() {
        UUID userId = UUID.randomUUID();

        String token = provider.create(userId);

        assertThat(provider.parseUserId(token)).isEqualTo(userId);
        assertThat(provider.isValid(token)).isTrue();
    }

    @Test
    void rejectsExpiredToken() throws InterruptedException {
        JwtTokenProvider shortLived =
                new JwtTokenProvider(new JwtProperties("gongspec-test-jwt-secret-key-32bytes", Duration.ofMillis(1)));
        String token = shortLived.create(UUID.randomUUID());
        Thread.sleep(20);

        assertThat(shortLived.isValid(token)).isFalse();
    }

    @Test
    void rejectsGarbageToken() {
        assertThat(provider.isValid("not-a-jwt")).isFalse();
    }
}
