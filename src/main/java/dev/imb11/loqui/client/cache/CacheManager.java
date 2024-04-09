package dev.imb11.loqui.client.cache;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.loader.api.FabricLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

public class CacheManager implements ClientModInitializer {
    public static final Path CACHE_DIR;
    private static final Logger LOGGER = LoggerFactory.getLogger("Loqui/CacheManager");
    private static final Gson gson = new Gson();

    public static void validateCache() throws IOException {
        if (!CACHE_DIR.toFile().exists()) {
            CACHE_DIR.resolve("assets/").toFile().mkdirs();
        }

        ArrayList<String> namespaces = new ArrayList<>();
        Files.walk(CACHE_DIR.resolve("assets/"))
                .filter(Files::isDirectory)
                .forEach(path -> namespaces.add(path.getFileName().toString()));

        for (String namespace : namespaces) {
            Path namespaceData = CACHE_DIR.resolve("assets/" + namespace + "/namespace_data_loqui.json");
            if (!Files.exists(namespaceData)) {
                Files.delete(CACHE_DIR.resolve("assets/" + namespace));
            } else {
                JsonObject object = gson.fromJson(Files.readString(namespaceData), JsonObject.class);
                String versionString = object.get("version").getAsString();
                String actualVersion = NamespaceHelper.getVersionFromNamespace(namespace);

                // May be disabled, or they may reinstall it later.
                if(actualVersion == null) continue;

                // If the versions do not match, delete the namespace cache - aggressive cache invalidation.
                if (!versionString.equals(actualVersion)) {
                    Files.delete(CACHE_DIR.resolve("assets/" + namespace));
                }
            }
        }
    }

    public static boolean contentExists(String namespace, String version, String language) {
        Path cachePath = CACHE_DIR.resolve("assets/" + namespace + "/lang/" + language + ".json");
        return cachePath.toFile().exists();
    }

    public static void submitContent(String namespace, String version, String language, String content) throws IOException {
        Path cachePath = CACHE_DIR.resolve("assets/" + namespace + "/lang/");
        if (!cachePath.toFile().exists()) {
            cachePath.toFile().mkdirs();
        }

        Files.writeString(Path.of(cachePath.toString(), language + ".json"), content);

        // Write version JSON to namespace_data_loqui.json
        JsonObject object = new JsonObject();
        object.addProperty("version", version);
        Files.writeString(CACHE_DIR.resolve("assets/" + namespace + "/namespace_data_loqui.json"), gson.toJson(object));
    }

    static {
        CACHE_DIR = FabricLoader.getInstance().getGameDir().resolve(".loqui_translations/");
    }

    public static Set<String> getCachedNamespaces() {
        // Get namespaces from the cache directory.
        HashSet<String> namespaces = new HashSet<>();
        try {
            Files.walk(CACHE_DIR.resolve("assets/"), 1)
                    .filter(Files::isDirectory)
                    .filter(path -> !path.getFileName().toString().equals("assets"))
                    .forEach(path -> namespaces.add(path.getFileName().toString()));
        } catch (IOException e) {
            LOGGER.error("Failed to get cached namespaces", e);
        }
        return namespaces;
    }

    @Override
    public void onInitializeClient() {
        try {
            CacheManager.validateCache();
        } catch (IOException ignored) {}
    }
}
