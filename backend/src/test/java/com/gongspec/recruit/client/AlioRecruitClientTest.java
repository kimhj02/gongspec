package com.gongspec.recruit.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.gongspec.common.exception.ApiException;
import com.gongspec.recruit.config.AlioProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.match.MockRestRequestMatchers;
import org.springframework.web.client.RestClient;

class AlioRecruitClientTest {

    private MockRestServiceServer server;
    private AlioRecruitClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new AlioRecruitClient(
                builder.build(),
                new AlioProperties(
                        "test-key",
                        "https://opendata.alio.go.kr",
                        new AlioProperties.Sync(false, "0 10 8,16 * * *", "Asia/Seoul")));
    }

    @Test
    void fetchesOngoingListAsJson() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("/new/v1/recruit/list.do")))
                .andExpect(method(HttpMethod.POST))
                .andExpect(MockRestRequestMatchers.queryParam("ongoingYn", "Y"))
                .andExpect(MockRestRequestMatchers.queryParam("resultType", "json"))
                .andExpect(MockRestRequestMatchers.queryParam("serviceKey", "test-key"))
                .andRespond(withSuccess(
                        """
                        {"resultCode":0,"totalCount":1,"result":[{"recrutPblntSn":11,"recrutPbancTtl":"사무직"}]}
                        """,
                        MediaType.APPLICATION_JSON));

        AlioRecruitClient.Page page = client.fetchOngoing(1);

        assertThat(page.totalCount()).isEqualTo(1);
        assertThat(page.items()).hasSize(1);
        assertThat(page.items().getFirst().get("recrutPblntSn").asLong()).isEqualTo(11L);
        server.verify();
    }

    @Test
    void treatsHttpStyleSuccessCodeAsOk() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("/new/v1/recruit/list.do")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(
                        """
                        {"resultCode":200,"resultMsg":"성공했습니다.","totalCount":1,"result":[{"recrutPblntSn":304810,"recrutPbancTtl":"정규직 채용"}]}
                        """,
                        MediaType.APPLICATION_JSON));

        AlioRecruitClient.Page page = client.fetchOngoing(1);

        assertThat(page.totalCount()).isEqualTo(1);
        assertThat(page.items()).hasSize(1);
        assertThat(page.items().getFirst().get("recrutPblntSn").asLong()).isEqualTo(304810L);
    }

    @Test
    void throwsWhenAlioResultCodeIsNotZero() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("/new/v1/recruit/list.do")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(
                        """
                        {"resultCode":7,"resultMsg":"인증키가 유효하지 않습니다."}
                        """,
                        MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.fetchOngoing(1))
                .isInstanceOf(ApiException.class)
                .hasMessage("인증키가 유효하지 않습니다.");
    }

    @Test
    void treatsEmptyObjectFieldsAsNoItems() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("/new/v1/recruit/list.do")))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"resultCode\":0,\"totalCount\":0,\"result\":{}}", MediaType.APPLICATION_JSON));

        AlioRecruitClient.Page page = client.fetchOngoing(1);

        assertThat(page.items()).isEmpty();
        assertThat(page.totalCount()).isZero();
    }
}
