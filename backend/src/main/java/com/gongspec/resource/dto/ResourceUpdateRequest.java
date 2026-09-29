package com.gongspec.resource.dto;

import com.gongspec.resource.entity.ResourceTab;
import java.util.List;
import java.util.Map;

/** 자료 수정 값을 받는다. null 공통 필드는 유지되지만 details가 제공되면 상세정보는 교체된다. */
public record ResourceUpdateRequest(
        ResourceTab tab,
        String title,
        String subtitle,
        String body,
        List<String> tags,
        String date,
        Boolean pinned,
        Boolean collapsed,
        Map<String, String> details) {}
