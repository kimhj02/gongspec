package com.gongspec.common.support;

import com.gongspec.common.exception.ApiException;
import java.util.regex.Pattern;

/** 입력 문자열에서 휴대전화 번호와 카카오 오픈채팅 주소 패턴을 찾아 거절한다. */
public final class ContactGuard {

    private static final Pattern PHONE = Pattern.compile("01[016789][\\s.-]?\\d{3,4}[\\s.-]?\\d{4}");
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
