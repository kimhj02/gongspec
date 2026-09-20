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
    void rejectsExpiredToken() {
        JwtTokenProvider shortLived =
                new JwtTokenProvider(new JwtProperties("gongspec-test-jwt-secret-key-32bytes", Duration.ofSeconds(-1)));
        String token = shortLived.create(UUID.randomUUID());

        assertThat(shortLived.isValid(token)).isFalse();
    }

    @Test
    void rejectsGarbageToken() {
        assertThat(provider.isValid("not-a-jwt")).isFalse();
    }

    @Test
    void rejectsTokenSignedWithAnotherKey() {
        JwtTokenProvider otherProvider =
                new JwtTokenProvider(new JwtProperties("another-test-jwt-secret-key-32bytes", Duration.ofHours(1)));

        assertThat(provider.isValid(otherProvider.create(UUID.randomUUID()))).isFalse();
    }
}
