package com.gongspec.resource.dto;

import com.gongspec.resource.entity.ResourceTab;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/** 자료 생성에 필요한 tab·제목과 선택적인 공통 필드·상세정보를 받는다. */
public record ResourceCreateRequest(
        @NotNull ResourceTab tab,
        @NotBlank String title,
        String subtitle,
        String body,
        List<String> tags,
        String date,
        Boolean pinned,
        Boolean collapsed,
        Map<String, String> details) {}
