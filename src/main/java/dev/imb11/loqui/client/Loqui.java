package dev.imb11.loqui.client;

import dev.imb11.loqui.client.cache.CacheManager;
import dev.imb11.loqui.client.i18n.LanguageIndexer;
import dev.imb11.loqui.client.i18n.LoquiDownloader;
import dev.imb11.loqui.client.i18n.LoquiUploader;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.entrypoint.PreLaunchEntrypoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Loqui implements PreLaunchEntrypoint {
    public static boolean HAS_REPORTED = false;
    public static final ExecutorService LOQUI_IO_POOL = Executors.newFixedThreadPool(2);

    public static Logger LOGGER = LoggerFactory.getLogger("Loqui");
    public static String API_ROOT = "https://loqui.imb11.dev";

    @Override
    public void onPreLaunch() {
        if(FabricLoader.getInstance().isDevelopmentEnvironment()) {
            API_ROOT = "http://localhost:9182";
        }

        try {
            CacheManager.validateCache();
        } catch (IOException e) {
            LOGGER.error("Failed to validate cache. This is a critical error. Please report this to https://github.com/IMB11/Loqui");
        }

        LanguageIndexer indexer = new LanguageIndexer(FabricLoader.getInstance().getGameDir().resolve("mods/"));
        var entries = indexer.index();

        String[] hashes = entries.stream().map(LanguageIndexer.IndexEntry::jarHash).toArray(String[]::new);
        LoquiDownloader.download(hashes);

        LoquiUploader.upload(entries);
    }
}
