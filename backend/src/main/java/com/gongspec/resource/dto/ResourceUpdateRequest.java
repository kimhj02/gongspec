package com.gongspec.resource.dto;

import com.gongspec.resource.entity.ResourceTab;
import java.util.List;
import java.util.Map;

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
