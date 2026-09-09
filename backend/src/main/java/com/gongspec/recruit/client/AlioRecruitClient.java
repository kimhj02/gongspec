package com.gongspec.recruit.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.gongspec.common.exception.ApiException;
import com.gongspec.recruit.config.AlioProperties;
import com.gongspec.recruit.support.AlioJson;
import com.gongspec.recruit.support.HireTypeMapper;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AlioRecruitClient {

    public static final int PAGE_SIZE = 100;

    private final RestClient restClient;
    private final AlioProperties properties;

    public AlioRecruitClient(RestClient restClient, AlioProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public Page fetchOngoing(int pageNo) {
        if (!properties.hasServiceKey()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ALIO 인증키가 없습니다. 프로젝트 루트 .env에 ALIO_SERVICE_KEY를 저장한 뒤 백엔드를 다시 시작해 주세요.");
        }
        try {
            JsonNode body = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .scheme(scheme())
                            .host(host())
                            .path("/new/v1/recruit/list.do")
                            .queryParam("serviceKey", properties.serviceKey())
                            .queryParam("resultType", "json")
                            .queryParam("ongoingYn", "Y")
                            .queryParam("hireTypeLst", HireTypeMapper.REQUEST_CODES)
                            .queryParam("pageNo", pageNo)
                            .queryParam("numOfRows", PAGE_SIZE)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
            if (body == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "채용공고를 불러오지 못했습니다.");
            }
            int resultCode = AlioJson.intValue(body, "resultCode");
            if (!isSuccess(resultCode)) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, alioMessage(body, resultCode));
            }
            JsonNode result = body.get("result");
            List<JsonNode> items = new ArrayList<>();
            if (result != null && result.isArray()) {
                result.forEach(items::add);
            } else if (result != null && result.isObject() && !result.isEmpty()) {
                items.add(result);
            }
            return new Page(items, AlioJson.intValue(body, "totalCount"));
        } catch (ApiException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "채용공고 서버에 연결하지 못했습니다.");
        }
    }

    private static boolean isSuccess(int resultCode) {
        return resultCode == 0 || resultCode == 200;
    }

    private static String alioMessage(JsonNode body, int resultCode) {
        String message = AlioJson.text(body, "resultMsg");
        if (!message.isBlank()) {
            return message;
        }
        return "채용공고를 불러오지 못했습니다. (" + resultCode + ")";
    }

    private String scheme() {
        String baseUrl = properties.baseUrl() == null || properties.baseUrl().isBlank()
                ? "https://opendata.alio.go.kr"
                : properties.baseUrl();
        return baseUrl.startsWith("http://") ? "http" : "https";
    }

    private String host() {
        String baseUrl = properties.baseUrl() == null || properties.baseUrl().isBlank()
                ? "https://opendata.alio.go.kr"
                : properties.baseUrl();
        return baseUrl.replaceFirst("^https?://", "").replaceFirst("/$", "");
    }

    public record Page(List<JsonNode> items, int totalCount) {}
}
