package com.gongspec.recruit.support;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class InstTypeMapperTest {

    @Test
    void mapsOfficial2026Types() {
        assertThat(InstTypeMapper.fromName("한국전력공사")).isEqualTo(
                new InstTypeMapper.Classification("공기업", "시장형 공기업"));
        assertThat(InstTypeMapper.fromName("한국토지주택공사")).isEqualTo(
                new InstTypeMapper.Classification("공기업", "준시장형 공기업"));
        assertThat(InstTypeMapper.fromName("국민연금공단")).isEqualTo(
                new InstTypeMapper.Classification("준정부", "기금관리형 준정부기관"));
        assertThat(InstTypeMapper.fromName("한국산업인력공단")).isEqualTo(
                new InstTypeMapper.Classification("준정부", "위탁집행형 준정부기관"));
        assertThat(InstTypeMapper.fromName("대한적십자사")).isEqualTo(
                new InstTypeMapper.Classification("기타", "기타공공기관"));
    }

    @Test
    void normalizesCompanySuffixesAndAliases() {
        assertThat(InstTypeMapper.fromName("한국전력")).isEqualTo(InstTypeMapper.fromName("한국전력공사"));
        assertThat(InstTypeMapper.fromName("한국수력원자력(주)")).isEqualTo(InstTypeMapper.fromName("한국수력원자력"));
        assertThat(InstTypeMapper.fromName("한전KDN(주)").label()).isEqualTo("준시장형 공기업");
        assertThat(InstTypeMapper.fromName("㈜강원랜드").label()).isEqualTo("시장형 공기업");
        assertThat(InstTypeMapper.fromName("(재)우체국금융개발원").label()).isEqualTo("위탁집행형 준정부기관");
        assertThat(InstTypeMapper.fromName("코레일").label()).isEqualTo("준시장형 공기업");
    }
}
