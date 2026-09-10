package com.gongspec.common.support;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.gongspec.common.exception.ApiException;
import org.junit.jupiter.api.Test;

class ContactGuardTest {

    @Test
    void rejectsPhoneNumbersAndOpenChat() {
        assertThatThrownBy(() -> ContactGuard.rejectIfPresent("연락처 010-1234-5678"))
                .isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> ContactGuard.rejectIfPresent("https://open.kakao.com/o/abc"))
                .isInstanceOf(ApiException.class);
    }
}
