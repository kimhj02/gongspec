package com.gongspec.study.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.gongspec.common.exception.ApiException;
import java.util.Arrays;

public enum StudyPurpose {
    WRITTEN("필기"),
    INTERVIEW("면접"),
    NCS("NCS"),
    ESSAY("자소서 첨삭"),
    OTHER("기타");

    private final String label;

    StudyPurpose(String label) {
        this.label = label;
    }

    @JsonValue
    public String label() {
        return label;
    }

    @JsonCreator
    public static StudyPurpose from(String value) {
        if (value == null || value.isBlank()) {
            throw ApiException.badRequest("목적을 선택해 주세요.");
        }
        return Arrays.stream(values())
                .filter(item -> item.label.equals(value) || item.name().equals(value))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("목적을 확인해 주세요."));
    }
}
