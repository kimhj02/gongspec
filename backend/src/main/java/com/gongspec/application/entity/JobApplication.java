package com.gongspec.application.entity;

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
@Table(name = "applications")
public class JobApplication extends ResourceItem {

    private static final Set<String> KEYS = Set.of(
            "category",
            "institution",
            "posting",
            "homepage",
            "documentAt",
            "documentAnnouncementAt",
            "documentResult",
            "writtenAt",
            "writtenAnnouncementAt",
            "writtenResult",
            "interviewAt",
            "interviewAnnouncementAt",
            "interviewResult",
            "interview2At",
            "interview2AnnouncementAt",
            "interview2Result",
            "interview3At",
            "interview3AnnouncementAt",
            "interview3Result");

    @Column(length = 50)
    private String category;

    @Column(length = 255)
    private String institution;

    @Column(length = 255)
    private String posting;

    @Column(length = 500)
    private String homepage;

    @Column(length = 10)
    private String documentAt;

    @Column(length = 10)
    private String documentAnnouncementAt;

    @Column(length = 20)
    private String documentResult;

    @Column(length = 10)
    private String writtenAt;

    @Column(length = 10)
    private String writtenAnnouncementAt;

    @Column(length = 20)
    private String writtenResult;

    @Column(length = 10)
    private String interviewAt;

    @Column(length = 10)
    private String interviewAnnouncementAt;

    @Column(length = 20)
    private String interviewResult;

    @Column(length = 10)
    private String interview2At;

    @Column(length = 10)
    private String interview2AnnouncementAt;

    @Column(length = 20)
    private String interview2Result;

    @Column(length = 10)
    private String interview3At;

    @Column(length = 10)
    private String interview3AnnouncementAt;

    @Column(length = 20)
    private String interview3Result;

    protected JobApplication() {}

    public JobApplication(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.applications;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        category = DetailMap.get(details, "category");
        institution = DetailMap.get(details, "institution");
        posting = DetailMap.get(details, "posting");
        homepage = DetailMap.get(details, "homepage");
        documentAt = DetailMap.get(details, "documentAt");
        documentAnnouncementAt = DetailMap.get(details, "documentAnnouncementAt");
        documentResult = DetailMap.get(details, "documentResult");
        writtenAt = DetailMap.get(details, "writtenAt");
        writtenAnnouncementAt = DetailMap.get(details, "writtenAnnouncementAt");
        writtenResult = DetailMap.get(details, "writtenResult");
        interviewAt = DetailMap.get(details, "interviewAt");
        interviewAnnouncementAt = DetailMap.get(details, "interviewAnnouncementAt");
        interviewResult = DetailMap.get(details, "interviewResult");
        interview2At = DetailMap.get(details, "interview2At");
        interview2AnnouncementAt = DetailMap.get(details, "interview2AnnouncementAt");
        interview2Result = DetailMap.get(details, "interview2Result");
        interview3At = DetailMap.get(details, "interview3At");
        interview3AnnouncementAt = DetailMap.get(details, "interview3AnnouncementAt");
        interview3Result = DetailMap.get(details, "interview3Result");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "category", category);
        DetailMap.put(details, "institution", institution);
        DetailMap.put(details, "posting", posting);
        DetailMap.put(details, "homepage", homepage);
        DetailMap.put(details, "documentAt", documentAt);
        DetailMap.put(details, "documentAnnouncementAt", documentAnnouncementAt);
        DetailMap.put(details, "documentResult", documentResult);
        DetailMap.put(details, "writtenAt", writtenAt);
        DetailMap.put(details, "writtenAnnouncementAt", writtenAnnouncementAt);
        DetailMap.put(details, "writtenResult", writtenResult);
        DetailMap.put(details, "interviewAt", interviewAt);
        DetailMap.put(details, "interviewAnnouncementAt", interviewAnnouncementAt);
        DetailMap.put(details, "interviewResult", interviewResult);
        DetailMap.put(details, "interview2At", interview2At);
        DetailMap.put(details, "interview2AnnouncementAt", interview2AnnouncementAt);
        DetailMap.put(details, "interview2Result", interview2Result);
        DetailMap.put(details, "interview3At", interview3At);
        DetailMap.put(details, "interview3AnnouncementAt", interview3AnnouncementAt);
        DetailMap.put(details, "interview3Result", interview3Result);
    }
}
