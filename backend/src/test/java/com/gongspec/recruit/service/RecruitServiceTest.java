package com.gongspec.recruit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gongspec.recruit.client.AlioRecruitClient;
import com.gongspec.recruit.config.AlioProperties;
import com.gongspec.recruit.dto.RecruitSyncResponse;
import com.gongspec.recruit.entity.PublicRecruit;
import com.gongspec.recruit.repository.PublicRecruitRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RecruitServiceTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Mock
    private AlioRecruitClient client;

    @Mock
    private PublicRecruitRepository repository;

    private RecruitService service;

    @BeforeEach
    void setUp() {
        service = new RecruitService(
                client,
                repository,
                new AlioProperties(
                        "test-key",
                        "https://opendata.alio.go.kr",
                        new AlioProperties.Sync(false, "0 10 8,16 * * *", "Asia/Seoul")));
    }

    @Test
    void upsertsMappedHireTypesAndClosesMissingOngoing() throws Exception {
        JsonNode kept = MAPPER.readTree(
                """
                {"recrutPblntSn":1,"recrutPbancTtl":"사무원","instNm":"한국전력","hireTypeLst":"R1010,R1040","pbancBgngYmd":"20260901","pbancEndYmd":"20260930","srcUrl":"https://example.com"}
                """);
        JsonNode skipped = MAPPER.readTree(
                """
                {"recrutPblntSn":2,"recrutPbancTtl":"비정규","hireTypeLst":"R1040"}
                """);
        when(client.fetchOngoing(1)).thenReturn(new AlioRecruitClient.Page(List.of(kept, skipped), 2));
        when(repository.findByRecrutPblntSn(1L)).thenReturn(Optional.empty());
        when(repository.save(any(PublicRecruit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PublicRecruit stale = new PublicRecruit(99L, "지난 공고");
        stale.replace("기관", "지난 공고", "정규직", "정규직", "R1010", "", "", "2026-01-01", "2026-01-31", true, "", null, "", null);
        when(repository.findByOngoingTrue()).thenReturn(List.of(stale));

        RecruitSyncResponse result = service.sync();

        ArgumentCaptor<PublicRecruit> captor = ArgumentCaptor.forClass(PublicRecruit.class);
        verify(repository).save(captor.capture());
        PublicRecruit saved = captor.getValue();
        assertThat(saved.getRecrutPblntSn()).isEqualTo(1L);
        assertThat(saved.getHireType()).isEqualTo("정규직");
        assertThat(saved.getHireTypes()).isEqualTo("정규직");
        assertThat(saved.getPbancEndYmd()).isEqualTo("2026-09-30");
        assertThat(saved.isOngoing()).isTrue();
        assertThat(stale.isOngoing()).isFalse();
        assertThat(result.fetched()).isEqualTo(2);
        assertThat(result.saved()).isEqualTo(1);
        assertThat(result.closed()).isEqualTo(1);
        verify(repository, never()).findByRecrutPblntSn(2L);
    }

    @Test
    void doesNotCloseOngoingWhenTheFetchIsIncomplete() throws Exception {
        when(client.fetchOngoing(1)).thenReturn(new AlioRecruitClient.Page(List.of(), 250));
        PublicRecruit stale = new PublicRecruit(99L, "지난 공고");
        stale.replace("기관", "지난 공고", "정규직", "정규직", "R1010", "", "", "2026-01-01", "2026-01-31", true, "", null, "", null);

        RecruitSyncResponse result = service.sync();

        assertThat(result.fetched()).isZero();
        assertThat(result.closed()).isZero();
        assertThat(stale.isOngoing()).isTrue();
        verify(repository, never()).findByOngoingTrue();
    }

    @Test
    void listsOngoingByHireType() {
        when(repository.searchOngoing("인턴", "한국")).thenReturn(List.of());
        assertThat(service.list(" 한국 ", "인턴")).isEmpty();
    }
}
