package com.gongspec.education.entity;

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
@Table(name = "educations")
public class Education extends ResourceItem {

    private static final Set<String> KEYS = Set.of("subject", "credits", "grade", "period", "periodStart", "periodEnd", "content");

    @Column(length = 255)
    private String subject;

    @Column(length = 50)
    private String credits;

    @Column(length = 50)
    private String grade;

    @Column(length = 64)
    private String period;

    @Column(length = 10)
    private String periodStart;

    @Column(length = 10)
    private String periodEnd;

    @Column(columnDefinition = "TEXT")
    private String content;

    protected Education() {}

    public Education(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.education;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        subject = DetailMap.get(details, "subject");
        credits = DetailMap.get(details, "credits");
        grade = DetailMap.get(details, "grade");
        period = DetailMap.get(details, "period");
        periodStart = DetailMap.get(details, "periodStart");
        periodEnd = DetailMap.get(details, "periodEnd");
        content = DetailMap.get(details, "content");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "subject", subject);
        DetailMap.put(details, "credits", credits);
        DetailMap.put(details, "grade", grade);
        DetailMap.put(details, "period", period);
        DetailMap.put(details, "periodStart", periodStart);
        DetailMap.put(details, "periodEnd", periodEnd);
        DetailMap.put(details, "content", content);
    }
}
