package com.gongspec.recruit.dto;

/** 동기화에서 수집한 항목 수, 저장한 항목 수, 마감 처리한 공고 수를 반환한다. */
public record RecruitSyncResponse(int fetched, int saved, int closed) {}
