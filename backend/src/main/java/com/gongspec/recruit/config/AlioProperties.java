package com.gongspec.recruit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

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
