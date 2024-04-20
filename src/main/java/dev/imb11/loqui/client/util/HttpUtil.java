package dev.imb11.loqui.client.util;

import org.apache.commons.io.IOUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.IOException;
import java.io.InputStreamReader;

import static dev.imb11.loqui.client.Loqui.API_ROOT;

public class HttpUtil {
    public static String postAPI(String route, String body) throws IOException {
        StringEntity entity = new StringEntity(body, "UTF-8");
        CloseableHttpClient client = HttpClientBuilder.create()
                .setRedirectStrategy(new CloudflareRedirectStrategy(entity))
                .build();

        HttpPost request = new HttpPost(API_ROOT + route);
        request.setHeader("Content-Type", "application/json");
        request.setHeader("User-Agent", "Loqui Mod");
        request.setEntity(entity);

        CloseableHttpResponse response = client.execute(request);
        var bodyRes = response.getEntity().getContent();
        return IOUtils.toString(new InputStreamReader(bodyRes));
    }
}
