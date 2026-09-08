package com.gongspec.user.entity;

import com.gongspec.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String kakaoId;

    @Column(nullable = false, length = 100)
    private String nickname;

    @Column(length = 255)
    private String email;

    protected User() {}

    public User(String kakaoId, String nickname, String email) {
        this.kakaoId = kakaoId;
        this.nickname = nickname;
        this.email = email;
    }

    public String getKakaoId() {
        return kakaoId;
    }

    public String getNickname() {
        return nickname;
    }

    public String getEmail() {
        return email;
    }

    public void updateProfile(String nickname, String email) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (email != null && !email.isBlank()) {
            this.email = email;
        }
    }
}
