package com.gongspec.recruit.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import org.junit.jupiter.api.Test;

class HireTypeMapperTest {

    @Test
    void mapsRegularAndInternCodes() {
        assertThat(HireTypeMapper.categories("R1010,R1070")).containsExactly("정규직");
        assertThat(HireTypeMapper.categories("R1020,R1030")).containsExactly("계약직");
        assertThat(HireTypeMapper.categories("R1050,R1060")).containsExactly("인턴");
    }

    @Test
    void dropsNonRegularAndKeepsHigherPriority() {
        assertThat(HireTypeMapper.categories("R1040")).isEmpty();
        assertThat(HireTypeMapper.primary(HireTypeMapper.categories("R1040"))).isNull();
        assertThat(HireTypeMapper.primary(HireTypeMapper.categories("R1010,R1040,R1050"))).isEqualTo("정규직");
        assertThat(HireTypeMapper.primary(HireTypeMapper.categories("R1020,R1050"))).isEqualTo("계약직");
        assertThat(HireTypeMapper.primary(Set.of("인턴"))).isEqualTo("인턴");
    }

    @Test
    void ignoresBlankAndUnknownCodes() {
        assertThat(HireTypeMapper.categories("")).isEmpty();
        assertThat(HireTypeMapper.categories(" r1010 , R9999 ")).containsExactly("정규직");
        assertThat(HireTypeMapper.join(HireTypeMapper.categories("R1070,R1020"))).isEqualTo("정규직,계약직");
    }
}
