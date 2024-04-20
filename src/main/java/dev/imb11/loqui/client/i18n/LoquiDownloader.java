package dev.imb11.loqui.client.i18n;

import com.google.gson.Gson;
import dev.imb11.loqui.client.util.CloudflareRedirectStrategy;
import dev.imb11.loqui.client.util.HttpUtil;
import net.minecraft.Util;
import org.apache.commons.io.IOUtils;
import org.apache.http.client.methods.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.CompletableFuture;

import static dev.imb11.loqui.client.Loqui.API_ROOT;
import static dev.imb11.loqui.client.Loqui.LOQUI_IO_POOL;

public class LoquiDownloader {
    private static Logger LOGGER = LoggerFactory.getLogger("Loqui/Downloader");
    public static void download(String[] hashes) {
        Gson gson = new Gson();
        String jsonData = gson.toJson(hashes);

        // Send jsonData to API_ROOT/api/v2/retrieve
        CompletableFuture.<Void>supplyAsync(() -> {
            try {
                HttpUtil.postAPI("/api/v2/retrieve", jsonData);
            } catch (IOException e) {
                LOGGER.error("Failed to download language files. This is a critical error. Please report this to https://discord.imb11.dev/", e);
            }

            return null;
        }, LOQUI_IO_POOL);
    }
}
