package com.gongspec.resource.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gongspec.resource.entity.ResourceItem;
import com.gongspec.resource.entity.ResourceTab;
import java.util.List;
import java.util.Map;

/** 자료 엔티티를 공통 API 형태로 변환하며 비어 있는 태그·상세정보는 응답에서 생략한다. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResourceResponse(
        String id,
        ResourceTab tab,
        String title,
        String subtitle,
        String body,
        List<String> tags,
        String date,
        boolean pinned,
        boolean collapsed,
        Map<String, String> details) {

    public static ResourceResponse from(ResourceItem resource) {
        return new ResourceResponse(
                resource.getId().toString(),
                resource.getTab(),
                resource.getTitle(),
                resource.getSubtitle(),
                resource.getBody(),
                emptyToNull(resource.getTags()),
                resource.getDate(),
                resource.isPinned(),
                resource.isCollapsed(),
                emptyToNull(resource.getDetails()));
    }

    private static <T> List<T> emptyToNull(List<T> values) {
        return values == null || values.isEmpty() ? null : values;
    }

    private static <K, V> Map<K, V> emptyToNull(Map<K, V> values) {
        return values == null || values.isEmpty() ? null : values;
    }
}
