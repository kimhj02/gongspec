package com.gongspec.recruit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.gongspec.common.exception.ApiException;
import com.gongspec.recruit.client.AlioRecruitClient;
import com.gongspec.recruit.config.AlioProperties;
import com.gongspec.recruit.dto.RecruitSyncResponse;
import com.gongspec.recruit.entity.PublicRecruit;
import com.gongspec.recruit.repository.PublicRecruitRepository;
import com.gongspec.recruit.support.AlioDates;
import com.gongspec.recruit.support.AlioJson;
import com.gongspec.recruit.support.HireTypeMapper;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecruitService {

    private static final int MAX_PAGES = 50;

    private final AlioRecruitClient client;
    private final PublicRecruitRepository repository;
    private final AlioProperties properties;

    public RecruitService(
            AlioRecruitClient client, PublicRecruitRepository repository, AlioProperties properties) {
        this.client = client;
        this.repository = repository;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public List<PublicRecruit> list(String query, String hireType) {
        String filter = hireType == null ? "" : hireType.trim();
        if (!filter.isEmpty() && !HireTypeMapper.FILTERS.contains(filter)) {
            throw ApiException.badRequest("고용형태가 올바르지 않습니다.");
        }
        String keyword = query == null ? "" : query.trim();
        return repository.searchOngoing(filter, keyword);
    }

    @Transactional
    public RecruitSyncResponse sync() {
        if (!properties.hasServiceKey()) {
            throw new ApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, "ALIO 인증키가 없습니다. 프로젝트 루트 .env에 ALIO_SERVICE_KEY를 저장한 뒤 백엔드를 다시 시작해 주세요.");
        }
        Instant fetchedAt = Instant.now();
        Set<Long> seen = new HashSet<>();
        int fetched = 0;
        int saved = 0;
        int pageNo = 1;
        int totalCount = Integer.MAX_VALUE;

        while ((pageNo - 1L) * AlioRecruitClient.PAGE_SIZE < totalCount && pageNo <= MAX_PAGES) {
            AlioRecruitClient.Page page = client.fetchOngoing(pageNo);
            totalCount = page.totalCount();
            fetched += page.items().size();
            for (JsonNode item : page.items()) {
                if (upsert(item, fetchedAt, seen)) {
                    saved++;
                }
            }
            if (page.items().isEmpty()) {
                break;
            }
            pageNo++;
        }

        int closed = 0;
        for (PublicRecruit recruit : repository.findByOngoingTrue()) {
            if (!seen.contains(recruit.getRecrutPblntSn())) {
                recruit.markClosed();
                closed++;
            }
        }
        return new RecruitSyncResponse(fetched, saved, closed);
    }

    private boolean upsert(JsonNode item, Instant fetchedAt, Set<Long> seen) {
        long serial = AlioJson.longValue(item, "recrutPblntSn");
        if (serial <= 0) {
            return false;
        }
        Set<String> categories = HireTypeMapper.categories(AlioJson.text(item, "hireTypeLst"));
        String primary = HireTypeMapper.primary(categories);
        if (primary == null) {
            return false;
        }
        seen.add(serial);
        String rawTitle = AlioJson.text(item, "recrutPbancTtl");
        String title = rawTitle.isBlank() ? "제목 없음" : rawTitle;
        int nope = AlioJson.intValue(item, "recrutNope");
        PublicRecruit recruit = repository
                .findByRecrutPblntSn(serial)
                .orElseGet(() -> new PublicRecruit(serial, title));
        recruit.replace(
                AlioJson.text(item, "instNm"),
                title,
                primary,
                HireTypeMapper.join(categories),
                AlioJson.text(item, "hireTypeLst"),
                AlioJson.text(item, "recrutSeNm"),
                AlioJson.text(item, "workRgnNmLst"),
                AlioDates.toDateKey(AlioJson.text(item, "pbancBgngYmd")),
                AlioDates.toDateKey(AlioJson.text(item, "pbancEndYmd")),
                true,
                AlioJson.text(item, "srcUrl"),
                nope > 0 ? nope : null,
                AlioJson.text(item, "ncsCdNmLst"),
                fetchedAt);
        repository.save(recruit);
        return true;
    }
}
