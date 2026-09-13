package com.gongspec.recruit.dto;

import com.gongspec.recruit.entity.PublicRecruit;
import com.gongspec.recruit.support.InstTypeMapper;

public record RecruitResponse(
        String id,
        long recrutPblntSn,
        String instNm,
        String instType,
        String instTypeNm,
        String title,
        String hireType,
        String hireTypes,
        String recrutSeNm,
        String workRgnNmLst,
        String pbancBgngYmd,
        String pbancEndYmd,
        boolean ongoing,
        String srcUrl,
        Integer recrutNope,
        String ncsCdNmLst) {

    public static RecruitResponse from(PublicRecruit recruit) {
        var instType = InstTypeMapper.of(recruit);
        return new RecruitResponse(
                recruit.getId().toString(),
                recruit.getRecrutPblntSn(),
                recruit.getInstNm(),
                instType.group(),
                instType.label(),
                recruit.getTitle(),
                recruit.getHireType(),
                recruit.getHireTypes(),
                recruit.getRecrutSeNm(),
                recruit.getWorkRgnNmLst(),
                recruit.getPbancBgngYmd(),
                recruit.getPbancEndYmd(),
                recruit.isOngoing(),
                recruit.getSrcUrl(),
                recruit.getRecrutNope(),
                recruit.getNcsCdNmLst());
    }
}
