package com.gongspec.essay.entity;

import com.gongspec.resource.entity.ResourceItem;
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.resource.support.DetailMap;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Map;
import java.util.Set;

/** 자기소개서의 문항 목록 JSON과 기존 단일 문항·본문를 전용 컬럼으로 저장하고 details 맵과 변환한다. */
@Entity
@Table(name = "essays")
public class Essay extends ResourceItem {

    private static final Set<String> KEYS = Set.of("entries", "item", "essay");

    @Column(columnDefinition = "TEXT")
    private String entries;

    @Column(columnDefinition = "TEXT")
    private String item;

    @Column(columnDefinition = "TEXT")
    private String essay;

    protected Essay() {}

    public Essay(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.essays;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        entries = DetailMap.get(details, "entries");
        item = DetailMap.get(details, "item");
        essay = DetailMap.get(details, "essay");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "entries", entries);
        DetailMap.put(details, "item", item);
        DetailMap.put(details, "essay", essay);
    }
}
