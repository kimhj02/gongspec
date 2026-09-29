package com.gongspec.career.entity;

import com.gongspec.resource.entity.ResourceItem;
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.resource.support.DetailMap;
import com.gongspec.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Map;
import java.util.Set;

/** 경력의 근무기관·고용형태·근무기간·담당업무를 전용 컬럼으로 저장하고 details 맵과 변환한다. */
@Entity
@Table(name = "careers")
public class Career extends ResourceItem {

    private static final Set<String> KEYS =
            Set.of("institution", "employmentType", "period", "periodStart", "periodEnd", "responsibilities");

    @Column(length = 255)
    private String institution;

    @Column(length = 50)
    private String employmentType;

    @Column(length = 64)
    private String period;

    @Column(length = 10)
    private String periodStart;

    @Column(length = 10)
    private String periodEnd;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    protected Career() {}

    public Career(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.career;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        institution = DetailMap.get(details, "institution");
        employmentType = DetailMap.get(details, "employmentType");
        period = DetailMap.get(details, "period");
        periodStart = DetailMap.get(details, "periodStart");
        periodEnd = DetailMap.get(details, "periodEnd");
        responsibilities = DetailMap.get(details, "responsibilities");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "institution", institution);
        DetailMap.put(details, "employmentType", employmentType);
        DetailMap.put(details, "period", period);
        DetailMap.put(details, "periodStart", periodStart);
        DetailMap.put(details, "periodEnd", periodEnd);
        DetailMap.put(details, "responsibilities", responsibilities);
    }
}
