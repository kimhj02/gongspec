package com.gongspec.recruit.support;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class HireTypeMapper {

    public static final String REQUEST_CODES = "R1010,R1020,R1030,R1050,R1060,R1070";
    public static final List<String> FILTERS = List.of("정규직", "계약직", "인턴");

    private HireTypeMapper() {}

    public static Set<String> categories(String hireTypeLst) {
        Set<String> categories = new LinkedHashSet<>();
        if (hireTypeLst == null || hireTypeLst.isBlank()) {
            return categories;
        }
        for (String raw : hireTypeLst.split(",")) {
            String code = raw.trim().toUpperCase(Locale.ROOT);
            String category = categoryOf(code);
            if (category != null) {
                categories.add(category);
            }
        }
        return categories;
    }

    public static String primary(Set<String> categories) {
        if (categories.contains("정규직")) {
            return "정규직";
        }
        if (categories.contains("계약직")) {
            return "계약직";
        }
        if (categories.contains("인턴")) {
            return "인턴";
        }
        return null;
    }

    public static String join(Set<String> categories) {
        return String.join(",", categories);
    }

    static String categoryOf(String code) {
        return switch (code) {
            case "R1010", "R1070" -> "정규직";
            case "R1020", "R1030" -> "계약직";
            case "R1050", "R1060" -> "인턴";
            default -> null;
        };
    }
}
