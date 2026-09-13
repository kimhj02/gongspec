package com.gongspec.recruit.support;

import com.gongspec.recruit.entity.PublicRecruit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class InstTypeMapper {

    public static final String GROUP_ENTERPRISE = "공기업";
    public static final String GROUP_QUASI = "준정부";
    public static final String GROUP_OTHER = "기타";
    public static final List<String> FILTERS = List.of(GROUP_ENTERPRISE, GROUP_QUASI, GROUP_OTHER);

    public static final String LABEL_MARKET = "시장형 공기업";
    public static final String LABEL_SEMI_MARKET = "준시장형 공기업";
    public static final String LABEL_FUND = "기금관리형 준정부기관";
    public static final String LABEL_ENTRUSTED = "위탁집행형 준정부기관";
    public static final String LABEL_OTHER = "기타공공기관";

    private static final Map<String, String> ALIASES = Map.of(
            "코레일", "한국철도공사",
            "lh", "한국토지주택공사",
            "캠코", "한국자산관리공사",
            "kotra", "대한무역투자진흥공사");

    private InstTypeMapper() {}

    public record Classification(String group, String label) {}

    public static Classification fromName(String instNm) {
        String label = LABELS.get(normalize(instNm));
        if (label == null) {
            return new Classification(GROUP_OTHER, LABEL_OTHER);
        }
        return new Classification(groupOf(label), label);
    }

    public static Classification of(PublicRecruit recruit) {
        if (recruit == null) {
            return new Classification(GROUP_OTHER, LABEL_OTHER);
        }
        String group = recruit.getInstType() == null ? "" : recruit.getInstType().trim();
        String label = recruit.getInstTypeNm() == null ? "" : recruit.getInstTypeNm().trim();
        if (FILTERS.contains(group) && !label.isEmpty()) {
            return new Classification(group, label);
        }
        return fromName(recruit.getInstNm());
    }

    public static String groupOf(String label) {
        if (LABEL_MARKET.equals(label) || LABEL_SEMI_MARKET.equals(label)) {
            return GROUP_ENTERPRISE;
        }
        if (LABEL_FUND.equals(label) || LABEL_ENTRUSTED.equals(label)) {
            return GROUP_QUASI;
        }
        return GROUP_OTHER;
    }

    static String normalize(String instNm) {
        if (instNm == null || instNm.isBlank()) {
            return "";
        }
        String value = instNm.toLowerCase(Locale.ROOT)
                .replace("주식회사", "")
                .replace("재단법인", "")
                .replace("사단법인", "")
                .replace("(주)", "")
                .replace("（주）", "")
                .replace("㈜", "")
                .replace("(재)", "")
                .replace("（재）", "")
                .replace("(사)", "")
                .replace("（사）", "")
                .replace(" ", "")
                .replace("·", "")
                .replace(".", "")
                .replace("-", "")
                .replace("_", "");
        return ALIASES.getOrDefault(value, value);
    }

    private static Map<String, String> buildLabels() {
        LinkedHashMap<String, String> labels = new LinkedHashMap<>();
        putAll(labels, LABEL_MARKET, MARKET);
        putAll(labels, LABEL_SEMI_MARKET, SEMI_MARKET);
        putAll(labels, LABEL_FUND, FUND);
        putAll(labels, LABEL_ENTRUSTED, ENTRUSTED);
        return Map.copyOf(labels);
    }

    private static void putAll(Map<String, String> labels, String label, Set<String> names) {
        for (String name : names) {
            labels.put(normalize(name), label);
        }
    }

    private static final Set<String> MARKET = Set.of(
            "인천국제공항공사",
            "한국공항공사",
            "한국도로공사",
            "한국남동발전",
            "한국남부발전",
            "한국동서발전",
            "한국서부발전",
            "한국수력원자력",
            "한국전력공사",
            "한국전력",
            "한국중부발전",
            "한국지역난방공사",
            "강원랜드",
            "한국가스공사",
            "한국석유공사");

    private static final Set<String> SEMI_MARKET = Set.of(
            "제주국제자유도시개발센터",
            "에스알",
            "주택도시보증공사",
            "한국부동산원",
            "한국철도공사",
            "한국토지주택공사",
            "한국수자원공사",
            "한국전력기술",
            "한전kdn",
            "한전kps",
            "한국마사회",
            "그랜드코리아레저",
            "한국가스기술공사",
            "한국광해광업공단",
            "한국조폐공사",
            "해양환경공단");

    private static final Set<String> FUND = Set.of(
            "근로복지공단",
            "신용보증기금",
            "예금보험공사",
            "한국자산관리공사",
            "한국주택금융공사",
            "국민체육진흥공단",
            "서울올림픽기념국민체육진흥공단",
            "국민연금공단",
            "한국무역보험공사",
            "공무원연금공단",
            "기술보증기금",
            "소상공인시장진흥공단",
            "중소벤처기업진흥공단");

    private static final Set<String> ENTRUSTED = Set.of(
            "한국도로교통공단",
            "도로교통공단",
            "한국고용정보원",
            "한국산업안전보건공단",
            "한국산업인력공단",
            "한국장애인고용공단",
            "한국소비자원",
            "우체국금융개발원",
            "우체국물류지원단",
            "한국방송통신전파진흥원",
            "한국연구재단",
            "한국인터넷진흥원",
            "한국지능정보사회진흥원",
            "한국장학재단",
            "한국보훈복지의료공단",
            "국가철도공단",
            "국토안전관리원",
            "한국교통안전공단",
            "한국국토정보공사",
            "한국재정정보원",
            "국립공원공단",
            "국립생태원",
            "한국에너지공단",
            "한국원자력환경공단",
            "한국전기안전공사",
            "한국전력거래소",
            "한국환경공단",
            "한국환경산업기술원",
            "축산물품질평가원",
            "한국농수산식품유통공사",
            "한국농어촌공사",
            "한국관광공사",
            "한국법무보호복지공단",
            "건강보험심사평가원",
            "국민건강보험공단",
            "한국사회보장정보원",
            "한국산림복지진흥원",
            "한국수목원정원관리원",
            "대한무역투자진흥공사",
            "한국가스안전공사",
            "한국산업기술기획평가원",
            "한국산업기술진흥원",
            "한국산업단지공단",
            "한국석유관리원",
            "한국국제협력단",
            "한국해양교통안전공단",
            "한국승강기안전공단");

    private static final Map<String, String> LABELS = buildLabels();
}
