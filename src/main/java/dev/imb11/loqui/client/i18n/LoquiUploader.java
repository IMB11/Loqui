package dev.imb11.loqui.client.i18n;

import com.google.gson.Gson;
import dev.imb11.loqui.client.util.HttpUtil;
import net.minecraft.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class LoquiUploader {
    private static final Logger LOGGER = LoggerFactory.getLogger("Loqui/Uploader");
    private record UploadEntry(String namespace, String jarVersion, String jarHash, String[] providedLocales, String baseLocaleData) {}
    public static void upload(List<LanguageIndexer.IndexEntry> entries) {
        // Convert entries to UploadEntry
        final ArrayList<UploadEntry> entryArrayList = new ArrayList<>();
        for(LanguageIndexer.IndexEntry entry : entries) {
            for(LanguageIndexer.NamespaceTranslationEntry namespaceEntry : entry.translationEntry()) {
                entryArrayList.add(new UploadEntry(
                        namespaceEntry.namespace,
                        entry.jarVersion(),
                        entry.jarHash(),
                        namespaceEntry.providedLocales.toArray(String[]::new),
                        namespaceEntry.englishLocaleContent
                ));
            }
        }

        String jsonData = new Gson().toJson(entryArrayList);

        CompletableFuture.<Void>supplyAsync(() -> {
            try {
                HttpUtil.postAPI("/api/v2/submit", jsonData);
            } catch (IOException e) {
                LOGGER.error("Failed to upload language files.", e);
            }

            return null;
        }, Util.ioPool());
    }
}
