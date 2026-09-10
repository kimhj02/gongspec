package com.gongspec.user.support;

import com.gongspec.common.exception.ApiException;
import com.gongspec.common.support.ContactGuard;
import java.util.regex.Pattern;

public final class SiteNickname {

    private static final Pattern ALLOWED = Pattern.compile("^[가-힣a-zA-Z0-9]{2,16}$");

    private SiteNickname() {}

    public static String normalize(String raw) {
        String nickname = raw == null ? "" : raw.trim();
        ContactGuard.rejectIfPresent(nickname);
        if (!ALLOWED.matcher(nickname).matches()) {
            throw ApiException.badRequest("닉네임은 한글·영문·숫자 2~16자로 정해 주세요.");
        }
        return nickname;
    }
}
