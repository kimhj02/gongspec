package com.gongspec.recruit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** ALIO 인증키·기본 주소·정기 동기화 주기와 시간대 설정을 바인딩한다. */
@ConfigurationProperties(prefix = "alio")
public record AlioProperties(String serviceKey, String baseUrl, Sync sync) {

    public AlioProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://opendata.alio.go.kr";
        }
        if (sync == null) {
            sync = new Sync(true, "0 10 8,16 * * *", "Asia/Seoul");
        } else {
            String cron = sync.cron() == null || sync.cron().isBlank() ? "0 10 8,16 * * *" : sync.cron();
            String zone = sync.zone() == null || sync.zone().isBlank() ? "Asia/Seoul" : sync.zone();
            sync = new Sync(sync.enabled(), cron, zone);
        }
    }

    public record Sync(boolean enabled, String cron, String zone) {}

    public boolean hasServiceKey() {
        return serviceKey != null && !serviceKey.isBlank();
    }
}
