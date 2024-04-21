package dev.imb11.loqui.client.i18n;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import dev.imb11.loqui.client.cache.CacheManager;
import dev.imb11.loqui.client.util.HttpUtil;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static dev.imb11.loqui.client.Loqui.LOQUI_IO_POOL;

public class LoquiDownloader {
    private static Logger LOGGER = LoggerFactory.getLogger("Loqui/Downloader");
    public static void download(String[] hashes) {
        Gson gson = new Gson();
        String jsonData = gson.toJson(hashes);

        // Send jsonData to API_ROOT/api/v2/retrieve
        CompletableFuture.<Void>supplyAsync(() -> {
            try {
                String jsonResult = HttpUtil.postAPI("/api/v2/retrieve", jsonData);
                LOGGER.info("Received language files from server.");
                LOGGER.info(jsonResult);
                JsonArray results = gson.fromJson(jsonResult, JsonArray.class);

                ArrayList<DownloadResult> downloadResults = getDownloadResults(results);

                for (DownloadResult result : downloadResults) {
                    LOGGER.info("Downloaded language file for " + result.hashObj().namespace());
                    LOGGER.info(result.toString());

                    JsonObject localeSet = result.localeSet();
                    String namespace = result.hashObj().namespace();
                    String localeHash = result.hashObj().localeFileHash();

                    // Save to cache
                    for (String localeCode : localeSet.keySet()) {
                        String localeContent = localeSet.get(localeCode).toString();
                        LOGGER.info("Saving locale file for " + namespace + " with locale code " + localeCode);
                        LOGGER.info(localeContent);
                        CacheManager.submitContent(namespace, localeHash, localeCode, localeContent);
                    }
                }

            } catch (IOException e) {
                LOGGER.error("Failed to download language files. This is a critical error. Please report this to https://discord.imb11.dev/", e);
            }

            return null;
        }, LOQUI_IO_POOL);
    }

    @NotNull
    private static ArrayList<DownloadResult> getDownloadResults(JsonArray results) {
        ArrayList<DownloadResult> downloadResults = new ArrayList<>();
        for (JsonElement element : results) {
            JsonObject result = element.getAsJsonObject();
            JsonObject hashObj = result.get("hashObj").getAsJsonObject();
            ArrayList<String> ignoredLocales = new ArrayList<>();

            JsonArray ignoredLocalesArray = hashObj.get("ignoredLocales").getAsJsonArray();
            for (JsonElement ignoredLocale : ignoredLocalesArray) {
                ignoredLocales.add(ignoredLocale.getAsString());
            }

            HashInformation resultHashObj = new HashInformation(
                hashObj.get("namespace").getAsString(),
                hashObj.get("jarVersion").getAsString(),
                hashObj.get("localeFileHash").getAsString(),
                ignoredLocales,
                hashObj.get("_id").getAsString()
            );

            JsonObject localeSet = result.get("localeSet").getAsJsonObject();
            downloadResults.add(new DownloadResult(resultHashObj, localeSet));
        }
        return downloadResults;
    }

    public record HashInformation(String namespace, String jarVersion, String localeFileHash, ArrayList<String> ignoredLocales, String _id) {}
    public record DownloadResult(HashInformation hashObj, JsonObject localeSet) {}
}
