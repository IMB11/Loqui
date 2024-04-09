package dev.imb11.loqui.client.cache;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.ModContainer;
import net.fabricmc.loader.api.entrypoint.PreLaunchEntrypoint;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.zip.ZipFile;

public class NamespaceHelper implements PreLaunchEntrypoint {
    private static final HashMap<String, String> namespaceModIDMap = new HashMap<>();
    private static final Logger LOGGER = LoggerFactory.getLogger("Loqui/NamespaceHelper");

    public static @Nullable String getVersionFromNamespace(String namespace) {
        Optional<ModContainer> modContainer = FabricLoader.getInstance().getModContainer(namespace);

        if (modContainer.isPresent()) {
            return modContainer.get().getMetadata().getVersion().getFriendlyString();
        } else {
            // Try to get the mod ID from the namespace.
            String modID = namespaceModIDMap.get(namespace);
            if (modID != null) {
                Optional<ModContainer> container = FabricLoader.getInstance().getModContainer(modID);
                if (container.isPresent()) {
                    return container.get().getMetadata().getVersion().getFriendlyString();
                }
            }
        }

        return null;
    }

    @Override
    public void onPreLaunch() {
        // Get all JARs in the mods directory
        Path modsFolder = FabricLoader.getInstance().getGameDir().resolve("mods/");

        // Read fabric.mod.json from each JAR, get the mod ID.
        Gson gson = new Gson();
        try {
            Files.walk(modsFolder).filter(Files::isRegularFile).forEach(path -> {
                if (path.toString().endsWith(".jar")) {
                    // Enter jar resources.
                    AtomicReference<String> modID = new AtomicReference<>(null);
                    Set<String> namespaces = new HashSet<>();
                    try (ZipFile zipFile = new ZipFile(path.toFile())) {
                        zipFile.stream().forEach(entry -> {
                            if (entry.getName().endsWith("fabric.mod.json")) {
                                try {
                                    var reader = new InputStreamReader(zipFile.getInputStream(entry));
                                    JsonObject object = gson.fromJson(reader, JsonObject.class);

                                    modID.set(object.get("id").getAsString());

                                    reader.close();
                                } catch (IOException e) {
                                    LOGGER.warn("Failed to read fabric.mod.json from " + path);
                                }
                            }

                            // Get all namespaces: all directories in the jar's assets folder.
                            if (entry.getName().startsWith("assets/")) {
                                String[] namespacePath = entry.getName().split("/");

                                if (namespacePath.length < 2) return;
                                if (namespacePath[1].isBlank()) return;

                                namespaces.add(namespacePath[1]);
                            }
                        });
                    } catch (IOException e) {
                        LOGGER.warn("Failed to read fabric.mod.json from " + path);
                    }

                    namespaces.remove("minecraft");

                    if (modID.get() == null) {
                        LOGGER.warn("Failed to read fabric.mod.json from " + path);
                    } else {
                        if (namespaces.isEmpty()) {
                            LOGGER.warn("No namespaces found for mod " + modID.get());
                        } else {
                            LOGGER.info("Found " + namespaces.size() + " namespaces for mod " + modID.get() + ": " + Arrays.toString(namespaces.toArray()));
                            for (String namespace : namespaces) {
                                namespaceModIDMap.putIfAbsent(namespace, modID.get());
                            }
                        }
                    }
                }
            });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
