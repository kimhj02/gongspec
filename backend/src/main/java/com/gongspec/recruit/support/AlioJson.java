package com.gongspec.recruit.support;

import com.fasterxml.jackson.databind.JsonNode;

/** ALIO 필드의 누락·null·숫자 문자열을 처리해 문자열 또는 숫자로 읽는다. */
public final class AlioJson {

    private AlioJson() {}

    public static String text(JsonNode node, String field) {
        if (node == null || !node.has(field)) {
            return "";
        }
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || value.isMissingNode()) {
            return "";
        }
        if (value.isObject() || value.isArray()) {
            return value.isEmpty() ? "" : value.toString();
        }
        String text = value.asText("");
        return text == null ? "" : text.trim();
    }

    public static long longValue(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return 0L;
        }
        JsonNode value = node.get(field);
        if (value.isNumber()) {
            return value.asLong();
        }
        try {
            String text = value.asText("");
            return text.isBlank() ? 0L : Long.parseLong(text.trim());
        } catch (NumberFormatException ignored) {
            return 0L;
        }
    }

    public static int intValue(JsonNode node, String field) {
        return (int) longValue(node, field);
    }
}
