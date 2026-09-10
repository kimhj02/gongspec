package com.gongspec.study.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.gongspec.common.exception.ApiException;
import java.util.Arrays;

public enum StudyStatus {
    OPEN("모집 중"),
    CLOSED("마감");

    private final String label;

    StudyStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String label() {
        return label;
    }

    @JsonCreator
    public static StudyStatus from(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(item -> item.label.equals(value) || item.name().equals(value))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("모집 상태를 확인해 주세요."));
    }
}
