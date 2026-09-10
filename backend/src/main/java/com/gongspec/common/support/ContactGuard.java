package com.gongspec.common.support;

import com.gongspec.common.exception.ApiException;
import java.util.regex.Pattern;

public final class ContactGuard {

    private static final Pattern PHONE = Pattern.compile("01[016789]-?\\d{3,4}-?\\d{4}");
    private static final Pattern OPEN_CHAT = Pattern.compile("open\\.kakao\\.com|openchat", Pattern.CASE_INSENSITIVE);

    private ContactGuard() {}

    public static void rejectIfPresent(String... texts) {
        for (String text : texts) {
            if (text == null || text.isBlank()) {
                continue;
            }
            if (PHONE.matcher(text).find() || OPEN_CHAT.matcher(text).find()) {
                throw ApiException.badRequest("전화번호나 오픈채팅 주소는 적을 수 없습니다. 댓글로 이야기해 주세요.");
            }
        }
    }
}
