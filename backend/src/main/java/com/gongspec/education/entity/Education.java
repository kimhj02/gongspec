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

/** 학교교육의 과목·학점·성적·교육기간·내용를 전용 컬럼으로 저장하고 details 맵과 변환한다. */
@Entity
@Table(name = "educations")
public class Education extends ResourceItem {

    // 이 키 목록에 있는 값은 아래 전용 컬럼에 매핑하고 나머지 상세값은 상위 클래스에서 보관한다.
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

    // JPA가 DB 조회 결과로 객체를 만들 때 사용하는 생성자다.
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

    // API의 details 값을 학교교육 컬럼에 반영한다. 전달되지 않은 키는 null로 바뀐다.
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

    // 조회 응답을 만들 때 값이 있는 컬럼만 details 맵으로 내보낸다.
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
