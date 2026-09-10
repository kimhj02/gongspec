package com.gongspec.study.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.gongspec.common.exception.ApiException;
import java.util.Arrays;

public enum StudyMode {
    ONLINE("온라인"),
    OFFLINE("오프라인"),
    HYBRID("혼합");

    private final String label;

    StudyMode(String label) {
        this.label = label;
    }

    @JsonValue
    public String label() {
        return label;
    }

    @JsonCreator
    public static StudyMode from(String value) {
        if (value == null || value.isBlank()) {
            throw ApiException.badRequest("진행 방식을 선택해 주세요.");
        }
        return Arrays.stream(values())
                .filter(item -> item.label.equals(value) || item.name().equals(value))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("진행 방식을 확인해 주세요."));
    }
}
