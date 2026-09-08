package com.gongspec.training.entity;

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
@Table(name = "trainings")
public class Training extends ResourceItem {

    private static final Set<String> KEYS =
            Set.of("institution", "subject", "ncs", "hours", "period", "periodStart", "periodEnd", "content");

    @Column(length = 255)
    private String institution;

    @Column(length = 255)
    private String subject;

    @Column(length = 255)
    private String ncs;

    @Column(length = 50)
    private String hours;

    @Column(length = 64)
    private String period;

    @Column(length = 10)
    private String periodStart;

    @Column(length = 10)
    private String periodEnd;

    @Column(columnDefinition = "TEXT")
    private String content;

    protected Training() {}

    public Training(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.training;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        institution = DetailMap.get(details, "institution");
        subject = DetailMap.get(details, "subject");
        ncs = DetailMap.get(details, "ncs");
        hours = DetailMap.get(details, "hours");
        period = DetailMap.get(details, "period");
        periodStart = DetailMap.get(details, "periodStart");
        periodEnd = DetailMap.get(details, "periodEnd");
        content = DetailMap.get(details, "content");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "institution", institution);
        DetailMap.put(details, "subject", subject);
        DetailMap.put(details, "ncs", ncs);
        DetailMap.put(details, "hours", hours);
        DetailMap.put(details, "period", period);
        DetailMap.put(details, "periodStart", periodStart);
        DetailMap.put(details, "periodEnd", periodEnd);
        DetailMap.put(details, "content", content);
    }
}
