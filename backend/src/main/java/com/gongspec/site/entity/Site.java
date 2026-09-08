package com.gongspec.site.entity;

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
@Table(name = "sites")
public class Site extends ResourceItem {

    private static final Set<String> KEYS = Set.of("url", "description");

    @Column(length = 500)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String description;

    protected Site() {}

    public Site(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.sites;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        url = DetailMap.get(details, "url");
        description = DetailMap.get(details, "description");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "url", url);
        DetailMap.put(details, "description", description);
    }
}
