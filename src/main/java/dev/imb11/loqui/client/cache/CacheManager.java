package dev.imb11.loqui.client.cache;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.loader.api.FabricLoader;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class CacheManager {
    public static final Path CACHE_DIR;
    private static final Logger LOGGER = LoggerFactory.getLogger("Loqui/CacheManager");
    private static final Gson gson = new Gson();

    static {
        CACHE_DIR = FabricLoader.getInstance().getGameDir().resolve(".loqui_translations/");
    }

    public static void validateCache() throws IOException {
        // Check if CACHE_DIR/declaration.v2 exists
        Path declarationPath = CACHE_DIR.resolve("declaration.v2");
        File assetsDir = CACHE_DIR.resolve("assets/").toFile();
        if (!declarationPath.toFile().exists()) {
            // If it doesn't exist, delete the assets folder and create a new declaration file.
            FileUtils.deleteDirectory(assetsDir);
            Files.writeString(declarationPath, "This is a declaration file for Loqui's cache. Do not delete this file.");
            assetsDir.mkdirs();
        }

        if(!assetsDir.exists()) {
            assetsDir.mkdirs();
        }

        ArrayList<String> namespaces = new ArrayList<>();
        String[] directories = assetsDir.list((current, name) -> new File(current, name).isDirectory());
        if (directories != null) {
            namespaces.addAll(Arrays.asList(directories));
        }

        for (String namespace : namespaces) {
            Path namespaceData = CACHE_DIR.resolve("assets/" + namespace + "/namespace_data_loqui.json");
            if (!Files.exists(namespaceData)) {
                // Delete an invalid cache entry.
                Files.delete(CACHE_DIR.resolve("assets/" + namespace));
            } else {
                JsonObject object = gson.fromJson(Files.readString(namespaceData), JsonObject.class);
                String namespaceHash = object.get("hash").getAsString();
                String actualHash = HashManager.getHash(namespace);

                // May be disabled, or they may reinstall it later.
                if (actualHash == null) continue;

                // If the hashes do not match, delete the cache entry.
                if (!namespaceHash.equals(actualHash)) {
                    Files.delete(CACHE_DIR.resolve("assets/" + namespace));
                }
            }
        }
    }

    public static boolean contentExists(String namespace, String language) {
        Path cachePath = CACHE_DIR.resolve("assets/" + namespace + "/lang/" + language + ".json");
        return cachePath.toFile().exists();
    }

    public static void submitContent(String namespace, String localeHash, String language, String content) throws IOException {
        Path cachePath = CACHE_DIR.resolve("assets/" + namespace + "/lang/");
        if (!cachePath.toFile().exists()) {
            cachePath.toFile().mkdirs();
        }

        Files.writeString(Path.of(cachePath.toString(), language + ".json"), content);

        JsonObject object = new JsonObject();
        object.addProperty("hash", localeHash);
        Files.writeString(CACHE_DIR.resolve("assets/" + namespace + "/namespace_data_loqui.json"), gson.toJson(object));
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
}
