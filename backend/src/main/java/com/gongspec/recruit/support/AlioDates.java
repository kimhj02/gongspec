package com.gongspec.recruit.support;

/** ALIO 날짜에서 숫자를 추출해 앞 8자리를 YYYY-MM-DD 형식으로 바꾼다. */
public final class AlioDates {

    private AlioDates() {}

    public static String toDateKey(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() >= 8) {
            return digits.substring(0, 4) + "-" + digits.substring(4, 6) + "-" + digits.substring(6, 8);
        }
        return "";
    }
}
