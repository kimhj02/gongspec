package com.gongspec.recruit.support;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AlioDatesTest {

    @Test
    void convertsCompactAndDashedDates() {
        assertThat(AlioDates.toDateKey("20260930")).isEqualTo("2026-09-30");
        assertThat(AlioDates.toDateKey("2026-09-30")).isEqualTo("2026-09-30");
        assertThat(AlioDates.toDateKey("")).isEmpty();
        assertThat(AlioDates.toDateKey("{}")).isEmpty();
    }
}
