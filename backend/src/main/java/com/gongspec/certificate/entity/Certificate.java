package com.gongspec.certificate.entity;

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
@Table(name = "certificates")
public class Certificate extends ResourceItem {

    private static final Set<String> KEYS =
            Set.of("credential", "level", "issuer", "acquiredAt", "validity", "expiresAt", "registrationNumber");

    @Column(length = 255)
    private String credential;

    @Column(length = 50)
    private String level;

    @Column(length = 255)
    private String issuer;

    @Column(length = 10)
    private String acquiredAt;

    @Column(length = 20)
    private String validity;

    @Column(length = 10)
    private String expiresAt;

    @Column(length = 100)
    private String registrationNumber;

    protected Certificate() {}

    public Certificate(User user, String title) {
        super(user, title);
    }

    @Override
    public ResourceTab getTab() {
        return ResourceTab.certificate;
    }

    @Override
    protected Set<String> specificKeys() {
        return KEYS;
    }

    @Override
    protected void applySpecific(Map<String, String> details) {
        credential = DetailMap.get(details, "credential");
        level = DetailMap.get(details, "level");
        issuer = DetailMap.get(details, "issuer");
        acquiredAt = DetailMap.get(details, "acquiredAt");
        validity = DetailMap.get(details, "validity");
        expiresAt = DetailMap.get(details, "expiresAt");
        registrationNumber = DetailMap.get(details, "registrationNumber");
    }

    @Override
    protected void exportSpecific(Map<String, String> details) {
        DetailMap.put(details, "credential", credential);
        DetailMap.put(details, "level", level);
        DetailMap.put(details, "issuer", issuer);
        DetailMap.put(details, "acquiredAt", acquiredAt);
        DetailMap.put(details, "validity", validity);
        DetailMap.put(details, "expiresAt", expiresAt);
        DetailMap.put(details, "registrationNumber", registrationNumber);
    }
}
