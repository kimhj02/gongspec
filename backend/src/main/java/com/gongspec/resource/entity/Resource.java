package com.gongspec.resource.entity;

import com.gongspec.common.convert.StringListConverter;
import com.gongspec.common.convert.StringMapConverter;
import com.gongspec.common.entity.BaseEntity;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "resources")
public class Resource extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ResourceTab tab;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> tags = new ArrayList<>();

    @Column(length = 10)
    private String date;

    @Column(nullable = false)
    private boolean pinned;

    @Column(nullable = false)
    private boolean collapsed;

    @Convert(converter = StringMapConverter.class)
    @Column(columnDefinition = "TEXT")
    private Map<String, String> details = new LinkedHashMap<>();

    protected Resource() {}

    public Resource(User user, ResourceTab tab, String title) {
        this.user = user;
        this.tab = tab;
        this.title = title;
    }

    public void merge(
            ResourceTab tab,
            String title,
            String subtitle,
            String body,
            List<String> tags,
            String date,
            Boolean pinned,
            Boolean collapsed,
            Map<String, String> details) {
        if (tab != null) {
            this.tab = tab;
        }
        if (title != null) {
            this.title = title;
        }
        if (subtitle != null) {
            this.subtitle = subtitle.isBlank() ? null : subtitle;
        }
        if (body != null) {
            this.body = body.isBlank() ? null : body;
        }
        if (tags != null) {
            this.tags = new ArrayList<>(tags);
        }
        if (date != null) {
            this.date = date.isBlank() ? null : date;
        }
        if (pinned != null) {
            this.pinned = pinned;
        }
        if (collapsed != null) {
            this.collapsed = collapsed;
        }
        if (details != null) {
            this.details = new LinkedHashMap<>(details);
        }
    }

    public User getUser() {
        return user;
    }

    public ResourceTab getTab() {
        return tab;
    }

    public String getTitle() {
        return title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public String getBody() {
        return body;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getDate() {
        return date;
    }

    public boolean isPinned() {
        return pinned;
    }

    public boolean isCollapsed() {
        return collapsed;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public boolean matchesQuery(String query) {
        if (query == null || query.isBlank()) {
            return true;
        }
        String needle = query.toLowerCase();
        if (contains(title, needle) || contains(subtitle, needle) || contains(body, needle)) {
            return true;
        }
        if (tags != null && tags.stream().anyMatch(tag -> contains(tag, needle))) {
            return true;
        }
        return details != null && details.values().stream().anyMatch(value -> contains(value, needle));
    }

    private static boolean contains(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle);
    }
}
