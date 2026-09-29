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

/** 자료의 제목·소유자·정렬 상태와 상세정보 변환을 정의하는 매핑 상위 클래스. 공통 필드는 각 자료 테이블에 저장된다. */
@MappedSuperclass
public abstract class ResourceItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
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

    private Integer sortOrder;

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

    // 공통 필드는 null이면 유지한다. details는 부분 병합하지 않으므로 호출자가 보존할 상세값까지 보내야 한다.
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
        // 알려진 키는 전용 컬럼으로, 그 외 키(예: 지원 체크리스트)는 extras JSON으로 나누어 저장한다.
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

    public int getSortOrder() {
        return sortOrder == null ? 0 : sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public boolean isCollapsed() {
        return collapsed;
    }

    // 응답에는 전용 컬럼과 확장 정보를 다시 하나의 details 맵으로 합친다.
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
