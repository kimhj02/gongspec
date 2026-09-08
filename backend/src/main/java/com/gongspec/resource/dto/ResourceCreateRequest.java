package com.gongspec.resource.dto;

import com.gongspec.resource.entity.ResourceTab;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

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
