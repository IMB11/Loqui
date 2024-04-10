package dev.imb11.loqui.client.i18n.in;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import dev.imb11.loqui.client.cache.CacheManager;
import dev.imb11.loqui.client.cache.NamespaceHelper;
import dev.imb11.loqui.client.i18n.out.LoquiProcessor;
import net.minecraft.Util;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.ProtocolException;
import org.apache.http.client.methods.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.apache.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static dev.imb11.loqui.client.Loqui.API_ROOT;

public class LoquiDownloader {
    private static final Logger LOGGER = LoggerFactory.getLogger("LoquiDownloader");
    public ArrayList<LanguageRequest> requests = new ArrayList<>();

    public LoquiDownloader(LoquiProcessor processor) {
        for (Map.Entry<String, ArrayList<String>> stringArrayListEntry : processor.getFilteredMissingLanguages().entrySet()) {
            String namespace = stringArrayListEntry.getKey();
            ArrayList<String> missingLanguages = stringArrayListEntry.getValue();
            String version = NamespaceHelper.getVersionFromNamespace(namespace);
            if (version == null) continue;

            for (String missingLanguage : missingLanguages.toArray(String[]::new)) {
                if (CacheManager.contentExists(namespace, version, missingLanguage)) {
                    missingLanguages.remove(missingLanguage);
                }
            }

            requests.add(new LanguageRequest(namespace, version, missingLanguages.toArray(String[]::new)));
        }
    }

    public void recieve() {
        CompletableFuture.<Void>supplyAsync(() -> {
            Gson gson = new Gson();
            String body = new Gson().toJson(requests);

            StringEntity entity = new StringEntity(body, "UTF-8");
            CloseableHttpClient client = HttpClientBuilder.create().setRedirectStrategy(new LaxRedirectStrategy() {

                /*
                 * (non-Javadoc)
                 *
                 * @see org.apache.http.impl.client.DefaultRedirectStrategy#
                 * getRedirect(org.apache.http.HttpRequest,
                 * org.apache.http.HttpResponse,
                 * org.apache.http.protocol.HttpContext)
                 */
                @Override
                public HttpUriRequest getRedirect(
                        HttpRequest request, HttpResponse response,
                        HttpContext context) throws ProtocolException {

                    final URI uri = getLocationURI(request, response, context);
                    final String method = request.getRequestLine().getMethod();
                    if (method.equalsIgnoreCase(HttpPost.METHOD_NAME)) {

                        HttpPost post = new HttpPost(uri);
                        post.setEntity(entity);
                        return post;
                    } else if (method.equalsIgnoreCase(HttpHead.METHOD_NAME)) {
                        return new HttpHead(uri);
                    } else if (method.equalsIgnoreCase(HttpGet.METHOD_NAME)) {
                        return new HttpGet(uri);
                    } else {
                        final int status =
                                response.getStatusLine().getStatusCode();
                        return status == HttpStatus.SC_TEMPORARY_REDIRECT
                                ? RequestBuilder.copy(request).setUri(uri).build()
                                : new HttpGet(uri);
                    }
                }

            }).build();

            HttpPost request = new HttpPost(API_ROOT + "/bulk-get");
            request.setHeader("Content-Type", "application/json");
            request.setHeader("User-Agent", "Loqui Mod");

            CloseableHttpResponse response;
            try {
                request.setEntity(entity);
                response = client.execute(request);

                // Parse the response, write language files to disk as cache.
                ArrayList<LanguageResponse> responses = new ArrayList<>();

                var bodyRes = response.getEntity().getContent();
                var bodyString = IOUtils.toString(new InputStreamReader(bodyRes));

                JsonArray array = gson.fromJson(bodyString, JsonElement.class).getAsJsonArray();
                for (JsonElement element : array) {
                    JsonObject obj = element.getAsJsonObject();

                    String namespace = obj.get("namespace").getAsString();
                    String version = obj.get("version").getAsString();
                    JsonObject contents = obj.getAsJsonObject("contents");

                    if (contents == null) continue;

                    HashMap<String, String> languageContents = new HashMap<>();
                    for (Map.Entry<String, JsonElement> entry : contents.entrySet()) {
                        languageContents.put(entry.getKey(), entry.getValue().getAsString());
                    }

                    responses.add(new LanguageResponse(namespace, version, languageContents));
                }

                for (LanguageResponse resp : responses) {
                    String namespace = resp.namespace();
                    String version = resp.version();

                    if (resp.contents() == null) continue;

                    for (Map.Entry<String, String> entry : resp.contents().entrySet()) {
                        String languageCode = entry.getKey();
                        String languageData = entry.getValue();

                        CacheManager.submitContent(namespace, version, languageCode, languageData);
                    }
                }
            } catch (Exception e) {
                LOGGER.error("Failed to download language files from Loqui API. " + e.getMessage());
            }

            return null;
        }, Util.ioPool());
    }
}
