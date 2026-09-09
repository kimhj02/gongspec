package com.gongspec.recruit.scheduler;

import com.gongspec.recruit.config.AlioProperties;
import com.gongspec.recruit.dto.RecruitSyncResponse;
import com.gongspec.recruit.service.RecruitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecruitSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecruitSyncScheduler.class);

    private final RecruitService recruitService;
    private final AlioProperties properties;

    public RecruitSyncScheduler(RecruitService recruitService, AlioProperties properties) {
        this.recruitService = recruitService;
        this.properties = properties;
    }

    @Scheduled(cron = "${alio.sync.cron:0 10 8,16 * * *}", zone = "${alio.sync.zone:Asia/Seoul}")
    public void syncOnSchedule() {
        if (!properties.sync().enabled()) {
            return;
        }
        if (!properties.hasServiceKey()) {
            log.warn("ALIO 인증키가 없어 채용공고 동기화를 건너뜁니다.");
            return;
        }
        try {
            RecruitSyncResponse result = recruitService.sync();
            log.info(
                    "채용공고 동기화 완료 fetched={} saved={} closed={}",
                    result.fetched(),
                    result.saved(),
                    result.closed());
        } catch (Exception exception) {
            log.warn("채용공고 동기화에 실패했습니다: {}", exception.getMessage());
        }
    }
}
