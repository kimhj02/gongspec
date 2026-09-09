package com.gongspec.recruit.dto;

import com.gongspec.recruit.entity.PublicRecruit;

public record RecruitResponse(
        String id,
        long recrutPblntSn,
        String instNm,
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
        return new RecruitResponse(
                recruit.getId().toString(),
                recruit.getRecrutPblntSn(),
                recruit.getInstNm(),
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
