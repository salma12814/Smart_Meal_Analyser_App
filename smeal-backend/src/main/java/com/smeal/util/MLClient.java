package com.smeal.util;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class MLClient {
    private final RestTemplate http;
    private final String baseUrl;
    public MLClient(@Qualifier("mlRestTemplate") RestTemplate http, @Value("${ml.api.url}") String baseUrl) {
        this.http = http; this.baseUrl = baseUrl;
    }
    public JsonNode postJson(String endpoint, Map<String, ?> payload) { return post(endpoint, payload); }
    public JsonNode postImage(String endpoint, byte[] bytes, String filename, String contentType) {
        ByteArrayResource resource = new ByteArrayResource(bytes) { @Override public String getFilename() { return filename; } };
        HttpHeaders partHeaders = new HttpHeaders(); partHeaders.setContentType(MediaType.parseMediaType(contentType));
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>(); form.add("file", new HttpEntity<>(resource, partHeaders));
        HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return post(endpoint, new HttpEntity<>(form, headers));
    }
    private JsonNode post(String endpoint, Object payload) {
        RestClientException last = null;
        for (int attempt = 0; attempt < 3; attempt++) {
            try { return http.postForObject(baseUrl + endpoint, payload, JsonNode.class); }
            catch (RestClientException e) {
                last = e;
                if (attempt < 2) try { Thread.sleep(250L << attempt); }
                catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); throw new IllegalStateException("Interrupted while retrying ML request", interrupted); }
            }
        }
        throw last;
    }
}
