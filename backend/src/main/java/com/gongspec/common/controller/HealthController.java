package com.gongspec.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** 컨테이너와 배포 점검에서 사용하는 공개 /api/health 응답을 제공한다. */
@Tag(name = "서버 상태", description = "서버 기동 확인")
@RestController
public class HealthController {

    @GetMapping("/api/health")
    @Operation(summary = "서버 상태 확인")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
