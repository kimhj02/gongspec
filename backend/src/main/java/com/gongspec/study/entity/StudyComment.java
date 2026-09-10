package com.gongspec.study.entity;

import com.gongspec.common.entity.BaseEntity;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_comments")
public class StudyComment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private StudyPost post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private boolean hidden;

    protected StudyComment() {}

    public StudyComment(StudyPost post, User author, String body) {
        this.post = post;
        this.author = author;
        this.body = body;
        this.hidden = false;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public StudyPost getPost() {
        return post;
    }

    public User getAuthor() {
        return author;
    }

    public String getBody() {
        return body;
    }

    public boolean isHidden() {
        return hidden;
    }
}
