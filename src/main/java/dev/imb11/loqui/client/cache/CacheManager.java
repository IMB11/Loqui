package dev.imb11.loqui.client.cache;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;

public class CacheManager implements ClientModInitializer {
    public static final Path CACHE_DIR;
    private static final Gson gson = new Gson();

    public static void validateCache() throws IOException {
        if (!CACHE_DIR.toFile().exists()) {
            CACHE_DIR.resolve("assets/").toFile().mkdirs();
        }

        // 1. Get all namespaces, where ** is the namespace: CACHE_DIR/assets/**/namespace_data_loqui.json
        // 2. For each namespace, check if the namespace_data_loqui.json file exists
        // 3. If it does not exist, delete the namespace cache.
        // 4. If it does, read the file and check the namespace version.
        // 5. Check what the actual loaded version is from loader.
        // 6. If the versions do not match, delete the namespace cache.
        // Else, leave it, it's valid!

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

    public static void submitContent(String namespace, String version, String language, String content) throws IOException {
        Path cachePath = CACHE_DIR.resolve("assets/" + namespace + "/lang/" + language + ".json");
        if (!cachePath.toFile().exists()) {
            cachePath.toFile().mkdirs();
        }

        Files.writeString(cachePath, content);

        // Write version JSON to namespace_data_loqui.json
        JsonObject object = new JsonObject();
        object.addProperty("version", version);
        Files.writeString(CACHE_DIR.resolve("assets/" + namespace + "/namespace_data_loqui.json"), gson.toJson(object));
    }

    static {
        CACHE_DIR = FabricLoader.getInstance().getGameDir().resolve(".loqui_translations/");
    }

    @Override
    public void onInitializeClient() {
        try {
            CacheManager.validateCache();
        } catch (IOException ignored) {}
    }
}