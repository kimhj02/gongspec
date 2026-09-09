package com.gongspec.recruit.entity;

import com.gongspec.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "public_recruits")
public class PublicRecruit extends BaseEntity {

    @Column(nullable = false, unique = true)
    private Long recrutPblntSn;

    @Column(length = 255)
    private String instNm;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 20)
    private String hireType;

    @Column(length = 80)
    private String hireTypes;

    @Column(length = 120)
    private String hireTypeCodes;

    @Column(length = 50)
    private String recrutSeNm;

    @Column(length = 500)
    private String workRgnNmLst;

    @Column(length = 10)
    private String pbancBgngYmd;

    @Column(length = 10)
    private String pbancEndYmd;

    @Column(nullable = false)
    private boolean ongoing = true;

    @Column(length = 500)
    private String srcUrl;

    private Integer recrutNope;

    @Column(length = 500)
    private String ncsCdNmLst;

    private Instant fetchedAt;

    protected PublicRecruit() {}

    public PublicRecruit(Long recrutPblntSn, String title) {
        this.recrutPblntSn = recrutPblntSn;
        this.title = title;
    }

    public void replace(
            String instNm,
            String title,
            String hireType,
            String hireTypes,
            String hireTypeCodes,
            String recrutSeNm,
            String workRgnNmLst,
            String pbancBgngYmd,
            String pbancEndYmd,
            boolean ongoing,
            String srcUrl,
            Integer recrutNope,
            String ncsCdNmLst,
            Instant fetchedAt) {
        this.instNm = instNm;
        this.title = title;
        this.hireType = hireType;
        this.hireTypes = hireTypes;
        this.hireTypeCodes = hireTypeCodes;
        this.recrutSeNm = recrutSeNm;
        this.workRgnNmLst = workRgnNmLst;
        this.pbancBgngYmd = pbancBgngYmd;
        this.pbancEndYmd = pbancEndYmd;
        this.ongoing = ongoing;
        this.srcUrl = srcUrl;
        this.recrutNope = recrutNope;
        this.ncsCdNmLst = ncsCdNmLst;
        this.fetchedAt = fetchedAt;
    }

    public void markClosed() {
        this.ongoing = false;
    }

    public Long getRecrutPblntSn() {
        return recrutPblntSn;
    }

    public String getInstNm() {
        return instNm;
    }

    public String getTitle() {
        return title;
    }

    public String getHireType() {
        return hireType;
    }

    public String getHireTypes() {
        return hireTypes;
    }

    public String getRecrutSeNm() {
        return recrutSeNm;
    }

    public String getWorkRgnNmLst() {
        return workRgnNmLst;
    }

    public String getPbancBgngYmd() {
        return pbancBgngYmd;
    }

    public String getPbancEndYmd() {
        return pbancEndYmd;
    }

    public boolean isOngoing() {
        return ongoing;
    }

    public String getSrcUrl() {
        return srcUrl;
    }

    public Integer getRecrutNope() {
        return recrutNope;
    }

    public String getNcsCdNmLst() {
        return ncsCdNmLst;
    }

    public Instant getFetchedAt() {
        return fetchedAt;
    }
}
