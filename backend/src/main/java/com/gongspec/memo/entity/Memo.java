package com.gongspec.memo.entity;

import com.gongspec.resource.entity.ResourceItem;
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.resource.support.DetailMap;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "memos")
public class Memo extends ResourceItem {

    private static final Set<String> KEYS = Set.of("content");

    @Column(columnDefinition = "TEXT")
    private String content;

    protected Memo() {}

    public Memo(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.memo;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        content = DetailMap.get(details, "content");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "content", content);
    }
}
