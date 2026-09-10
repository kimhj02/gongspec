package com.gongspec.common.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Cookie cookie, Admin admin) {

    public AppProperties {
        if (cors == null) {
            cors = new Cors(null);
        }
        if (cookie == null) {
            cookie = new Cookie(false);
        }
        if (admin == null) {
            admin = new Admin("");
        }
    }

    public record Cors(String origins) {
        public List<String> originList() {
            if (origins == null || origins.isBlank()) {
                return List.of("http://localhost:13001", "http://127.0.0.1:13001");
            }
            return Arrays.stream(origins.split(",")).map(String::trim).filter(origin -> !origin.isEmpty()).toList();
        }
    }

    public record Cookie(boolean secure) {}

    public record Admin(String kakaoIds) {
        public boolean includes(String kakaoId) {
            if (kakaoIds == null || kakaoIds.isBlank() || kakaoId == null || kakaoId.isBlank()) {
                return false;
            }
            return Arrays.stream(kakaoIds.split(","))
                    .map(String::trim)
                    .anyMatch(kakaoId::equals);
        }
    }
}
