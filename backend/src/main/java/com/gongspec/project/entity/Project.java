package com.gongspec.project.entity;

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
@Table(name = "projects")
public class Project extends ResourceItem {

    private static final Set<String> KEYS = Set.of(
            "name",
            "oneLiner",
            "period",
            "periodStart",
            "periodEnd",
            "role",
            "url",
            "stack",
            "background",
            "work",
            "problem",
            "results",
            "essay");

    @Column(length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String oneLiner;

    @Column(length = 64)
    private String period;

    @Column(length = 10)
    private String periodStart;

    @Column(length = 10)
    private String periodEnd;

    @Column(length = 255)
    private String role;

    @Column(length = 500)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String stack;

    @Column(columnDefinition = "TEXT")
    private String background;

    @Column(columnDefinition = "TEXT")
    private String work;

    @Column(columnDefinition = "TEXT")
    private String problem;

    @Column(columnDefinition = "TEXT")
    private String results;

    @Column(columnDefinition = "TEXT")
    private String essay;

    protected Project() {}

    public Project(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.project;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        name = DetailMap.get(details, "name");
        oneLiner = DetailMap.get(details, "oneLiner");
        period = DetailMap.get(details, "period");
        periodStart = DetailMap.get(details, "periodStart");
        periodEnd = DetailMap.get(details, "periodEnd");
        role = DetailMap.get(details, "role");
        url = DetailMap.get(details, "url");
        stack = DetailMap.get(details, "stack");
        background = DetailMap.get(details, "background");
        work = DetailMap.get(details, "work");
        problem = DetailMap.get(details, "problem");
        results = DetailMap.get(details, "results");
        essay = DetailMap.get(details, "essay");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "name", name);
        DetailMap.put(details, "oneLiner", oneLiner);
        DetailMap.put(details, "period", period);
        DetailMap.put(details, "periodStart", periodStart);
        DetailMap.put(details, "periodEnd", periodEnd);
        DetailMap.put(details, "role", role);
        DetailMap.put(details, "url", url);
        DetailMap.put(details, "stack", stack);
        DetailMap.put(details, "background", background);
        DetailMap.put(details, "work", work);
        DetailMap.put(details, "problem", problem);
        DetailMap.put(details, "results", results);
        DetailMap.put(details, "essay", essay);
    }
}
