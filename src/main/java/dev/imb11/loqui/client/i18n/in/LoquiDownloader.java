package dev.imb11.loqui.client.i18n.in;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import dev.imb11.loqui.client.LoquiEntrypoints;
import dev.imb11.loqui.client.LoquiReloadListener;
import dev.imb11.loqui.client.i18n.Util;
import dev.imb11.loqui.client.i18n.out.LoquiProcessor;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.Resource;
import net.minecraft.server.packs.resources.ResourceManager;
import org.apache.commons.io.IOUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

public class LoquiDownloader {
    public ArrayList<LanguageRequest> requests = new ArrayList<>();

    public LoquiDownloader(LoquiProcessor processor) {
        for (Map.Entry<String, ArrayList<String>> stringArrayListEntry : processor.getFilteredMissingLanguages().entrySet()) {
            String namespace = stringArrayListEntry.getKey();
            ArrayList<String> missingLanguages = stringArrayListEntry.getValue();
            String version = Util.getVersionFromNamespace(namespace);
            if(version == null) continue;
            requests.add(new LanguageRequest(namespace, version, missingLanguages.toArray(String[]::new)));
        }
    }

    public void recieve() {
        new Thread(() -> {
            Gson gson = new Gson();
            HttpClient client = HttpClient.newHttpClient();
            String body = new Gson().toJson(requests);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:9182/bulk-get"))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Loqui Mod")
                    .build();

            HttpResponse<String> response = null;
            try {
                response = client.send(request, HttpResponse.BodyHandlers.ofString());

                System.out.println(response.body());

                // Parse the response, write language files to disk as cache.
                ArrayList<LanguageResponse> responses = new ArrayList<>();

                JsonArray array = gson.fromJson(response.body(), JsonElement.class).getAsJsonArray();
                for (JsonElement element : array) {
                    JsonObject obj = element.getAsJsonObject();

                    System.out.println(obj);

                    String namespace = obj.get("namespace").getAsString();
                    String version = obj.get("version").getAsString();
                    JsonObject contents = obj.getAsJsonObject("contents");

                    if(contents == null) continue;

                    System.out.println(contents);

                    HashMap<String, String> languageContents = new HashMap<>();
                    for (Map.Entry<String, JsonElement> entry : contents.entrySet()) {
                        languageContents.put(entry.getKey(), entry.getValue().getAsString());
                    }

                    responses.add(new LanguageResponse(namespace, version, languageContents));
                }

                for (LanguageResponse resp : responses) {
                    String namespace = resp.namespace();
                    String version = resp.version();

                    if(resp.contents() == null) continue;

                    for (Map.Entry<String, String> entry : resp.contents().entrySet()) {
                        String languageCode = entry.getKey();
                        String languageData = entry.getValue();

                        Path path = LoquiReloadListener.CACHE_DIR.resolve(namespace + "-" + version + "-" + languageCode + ".json");
                        try {
                            Files.createDirectories(path.getParent());
                            Files.writeString(path, languageData);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }
                }
            } catch (IOException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        }).start();
    }
}
