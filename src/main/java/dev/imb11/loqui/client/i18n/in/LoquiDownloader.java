package dev.imb11.loqui.client.i18n.in;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import dev.imb11.loqui.client.cache.CacheManager;
import dev.imb11.loqui.client.cache.NamespaceHelper;
import dev.imb11.loqui.client.i18n.out.LoquiProcessor;
import net.minecraft.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
            HttpClient client = HttpClient.newHttpClient();
            String body = new Gson().toJson(requests);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_ROOT + "/bulk-get"))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Loqui Mod")
                    .build();

            HttpResponse<String> response;
            try {
                response = client.send(request, HttpResponse.BodyHandlers.ofString());

                // Parse the response, write language files to disk as cache.
                ArrayList<LanguageResponse> responses = new ArrayList<>();

                JsonArray array = gson.fromJson(response.body(), JsonElement.class).getAsJsonArray();
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
                LOGGER.error("Failed to download language files from Loqui API.");
            }

            return null;
        }, Util.ioPool());
    }
}
