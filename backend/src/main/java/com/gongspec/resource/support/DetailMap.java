package com.gongspec.resource.support;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

public final class DetailMap {

    private DetailMap() {}

    public static String get(Map<String, String> details, String key) {
        if (details == null) {
            return null;
        }
        String value = details.get(key);
        return value == null || value.isBlank() ? null : value;
    }

    public static void put(Map<String, String> details, String key, String value) {
        if (value != null && !value.isBlank()) {
            details.put(key, value);
        }
    }

    public static Map<String, String> extras(Map<String, String> details, Set<String> knownKeys) {
        Map<String, String> extras = new LinkedHashMap<>();
        if (details == null) {
            return extras;
        }
        details.forEach((key, value) -> {
            if (!knownKeys.contains(key) && value != null && !value.isBlank()) {
                extras.put(key, value);
            }
        });
        return extras;
    }
}
