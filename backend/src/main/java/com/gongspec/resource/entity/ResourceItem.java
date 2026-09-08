package com.gongspec.resource.entity;

import com.gongspec.common.convert.StringListConverter;
import com.gongspec.common.convert.StringMapConverter;
import com.gongspec.common.entity.BaseEntity;
import com.gongspec.resource.support.DetailMap;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@MappedSuperclass
public abstract class ResourceItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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
    private Map<String, String> extras = new LinkedHashMap<>();

    protected ResourceItem() {}

    protected ResourceItem(User user, String title) {
        this.user = user;
        this.title = title;
    }

    public abstract ResourceTab getTab();

    protected abstract Set<String> specificKeys();

    protected abstract void applySpecific(Map<String, String> details);

    protected abstract void exportSpecific(Map<String, String> details);

    public void merge(
            String title,
            String subtitle,
            String body,
            List<String> tags,
            String date,
            Boolean pinned,
            Boolean collapsed,
            Map<String, String> details) {
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
            applySpecific(details);
            this.extras = DetailMap.extras(details, specificKeys());
        }
    }

    public User getUser() {
        return user;
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
        Map<String, String> details = new LinkedHashMap<>();
        exportSpecific(details);
        if (extras != null) {
            extras.forEach(details::putIfAbsent);
        }
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
        return getDetails().values().stream().anyMatch(value -> contains(value, needle));
    }

    private static boolean contains(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle);
    }
}
