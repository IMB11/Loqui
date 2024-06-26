package dev.imb11.loqui.client;

import dev.imb11.loqui.client.cache.CacheManager;
import dev.imb11.loqui.client.cache.HashManager;
import dev.imb11.loqui.client.i18n.LanguageIndexer;
import dev.imb11.loqui.client.i18n.LoquiDownloader;
import dev.imb11.loqui.client.i18n.LoquiUploader;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.entrypoint.PreLaunchEntrypoint;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Stream;

public class Loqui implements PreLaunchEntrypoint {
    public static boolean HAS_REPORTED = false;
    public static final ExecutorService LOQUI_IO_POOL = Executors.newFixedThreadPool(2);

    public static Logger LOGGER = LoggerFactory.getLogger("Loqui");
    public static String API_ROOT = "https://loqui.imb11.dev";

    @Override
    public void onPreLaunch() {
        LOGGER.info("What if I was I robot and didn’t know it?");

        if(FabricLoader.getInstance().isDevelopmentEnvironment()) {
            API_ROOT = "http://localhost:9182";
        }

        LanguageIndexer indexer = new LanguageIndexer(FabricLoader.getInstance().getGameDir().resolve("mods/"));
        var entries = indexer.index();

        String[] hashes = entries.stream().map(entry -> {
            ArrayList<String> namespaceHashes = new ArrayList<>();
            for (LanguageIndexer.NamespaceTranslationEntry namespaceTranslationEntry : entry.translationEntry()) {
                String content = namespaceTranslationEntry.englishLocaleContent;
                String hash = DigestUtils.sha512Hex(content);
                HashManager.setHash(namespaceTranslationEntry.namespace, hash);
                namespaceHashes.add(hash);
            }

            return namespaceHashes.toArray(String[]::new);
        }).flatMap(Stream::of).toArray(String[]::new);

        try {
            CacheManager.validateCache();
        } catch (IOException e) {
            LOGGER.error("Failed to validate cache. This is a critical error. Please report this to https://github.com/IMB11/Loqui");
        }

        LoquiDownloader.download(hashes);
        LoquiUploader.upload(entries);
    }
}
