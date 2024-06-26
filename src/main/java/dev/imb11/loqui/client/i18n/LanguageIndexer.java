package dev.imb11.loqui.client.i18n;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class LanguageIndexer {
    private static final Logger LOGGER = LoggerFactory.getLogger("Loqui/LanguageIndexer");
    private final Path modsFolder;
    private final ArrayList<IndexEntry> indexEntries = new ArrayList<>();

    public LanguageIndexer(Path modsFolder) {
        this.modsFolder = modsFolder;
    }

    public ArrayList<IndexEntry> index() {
        // Get all jar files from mod folder, non recursive.

        File modsDir = modsFolder.toFile();
        File[] mods = modsDir.listFiles((dir, name) -> name.endsWith(".jar"));

        Gson GSON = new Gson();

        assert mods != null;
        for (File mod : mods) {
            try (ZipFile zipFile = new ZipFile(mod)) {
                // Check if .noloqui file exists (blacklist file)
                ZipEntry noloquiFile = zipFile.getEntry(".noloqui");

                if (noloquiFile != null) {
                    LOGGER.info("Skipping " + mod.getName() + " as it is blacklisted.");
                    continue;
                }

                var modDefinitionFile = zipFile.getEntry("fabric.mod.json");
                if (modDefinitionFile == null) {
                    LOGGER.warn("Skipping " + mod.getName() + " as it does not have a fabric.mod.json file.");
                    continue;
                }

                // Read mod definition file into JsonObject
                InputStream stream = zipFile.getInputStream(modDefinitionFile);
                JsonObject modDefinition = GSON.fromJson(new InputStreamReader(stream), JsonObject.class);
                stream.close();

                String modVersion = modDefinition.get("version").getAsString();
                String sha512 = DigestUtils.sha512Hex(Files.readAllBytes(mod.toPath()));

                Stream<? extends ZipEntry> zipEntries = zipFile.stream();

                HashMap<String, NamespaceTranslationEntry> namespaceEntries = new HashMap<>();
                
                // Get all lang files that match **/assets/**/lang/*.json
                zipEntries.filter(entry -> entry.getName().matches("(.+/)?assets/[^/]+/lang/[^/]+\\.json"))
                        .forEach(entry -> {
                            // Get part of entry's name that matches assets/**/lang/*.json
                            // Example: file/sub/folder/something/assets/modid/lang/en_us.json -> assets/modid/lang/en_us.json
                            // This is to support any separate resource packs that are loaded via Fabric Resource API or other means.
                            String matchedPath = entry.getName().replaceFirst(".*assets/", "assets/");
                            String[] pathSplit = matchedPath.split("/");
                            String namespace = pathSplit[1];
                            String filename = pathSplit[3];

                            // If it's en_us.json, load it into the namespace's translation entry.
                            if (entry.getName().endsWith("en_us.json")) {
                                NamespaceTranslationEntry namespaceEntry = namespaceEntries.computeIfAbsent(namespace, NamespaceTranslationEntry::new);
                                try {
                                    namespaceEntry.englishLocaleContent = new String(zipFile.getInputStream(entry).readAllBytes());
                                } catch (IOException e) {
                                    LOGGER.error("Failed to read en_us.json from " + mod.getName(), e);
                                }
                            } else {
                                // Otherwise, add the locale to the namespace's provided locales.
                                NamespaceTranslationEntry namespaceEntry = namespaceEntries.computeIfAbsent(namespace, NamespaceTranslationEntry::new);
                                namespaceEntry.providedLocales.add(filename.replace(".json", ""));
                            }
                        });

                // Remove any entries that didn't find en_us.json
                namespaceEntries.entrySet().removeIf(entry -> entry.getValue().englishLocaleContent == null);

                indexEntries.add(new IndexEntry(modVersion, sha512, namespaceEntries.values().stream().toList()));

                // Output all entries into console for debugging purposes, pretty.
                namespaceEntries.forEach((namespace, entry) -> {
                    LOGGER.info("Indexed " + namespace + " from " + mod.getName() + " with existing locales of: " + Arrays.toString(entry.providedLocales.toArray()));
                    LOGGER.info("en_us.json size: " + entry.englishLocaleContent.getBytes().length + " bytes.");
                });
            } catch (IOException e) {
                LOGGER.error("Failed to index file: " + mod.getName(), e);
            }
        }

        return indexEntries;
    }

    public static class NamespaceTranslationEntry {
        public final ArrayList<String> providedLocales = new ArrayList<>();
        public final String namespace;
        public String englishLocaleContent;

        public NamespaceTranslationEntry(String namespace) {
            this.namespace = namespace;
        }
    }

    public record IndexEntry(String jarVersion, String jarHash, List<NamespaceTranslationEntry> translationEntry) {}
}
