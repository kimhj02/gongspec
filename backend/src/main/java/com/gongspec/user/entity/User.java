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

    @Column(unique = true, length = 30)
    private String siteNickname;

    @Column(length = 255)
    private String email;

    @Column(name = "is_admin", nullable = false, columnDefinition = "boolean not null default false")
    private boolean admin;

    protected User() {}

    public User(String kakaoId, String nickname, String email) {
        this.kakaoId = kakaoId;
        this.nickname = nickname == null || nickname.isBlank() ? "사용자" : nickname;
        this.email = email;
        this.admin = false;
    }

    public String getKakaoId() {
        return kakaoId;
    }

    public String getNickname() {
        return nickname;
    }

    public String getSiteNickname() {
        return siteNickname;
    }

    public String displayNickname() {
        return siteNickname == null || siteNickname.isBlank() ? "" : siteNickname;
    }

    public boolean needsNickname() {
        return siteNickname == null || siteNickname.isBlank();
    }

    public String getEmail() {
        return email;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void updateProfile(String nickname, String email) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (email != null && !email.isBlank()) {
            this.email = email;
        }
    }

    public void setSiteNickname(String siteNickname) {
        this.siteNickname = siteNickname;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}
