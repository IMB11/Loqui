package dev.imb11.loqui.client.i18n;

import com.google.gson.Gson;
import net.fabricmc.fabric.impl.resource.loader.FabricModResourcePack;
import net.fabricmc.fabric.impl.resource.loader.FabricResource;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.ModContainer;
import net.minecraft.resources.ResourceLocation;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

/**
 * Packages en_us.json language files into a single file for the API.
 */
public class LoquiPackager {
    public static final Logger LOGGER = LoggerFactory.getLogger("LoquiPackager");
    public final ArrayList<LanguagePackage> languagePackages = new ArrayList<>();

    /**
     * Constructs a new LoquiPackager - it's recommended to run this off-thread.
     * @param processor A completely processed LoquiProcessor.
     */
    public LoquiPackager(LoquiProcessor processor) throws IOException {
        var missingLanguages = processor.getFilteredMissingLanguages();
        var languageFiles = processor.getLanguageFiles();

        for (String namespace : missingLanguages.keySet()) {
            ResourceLocation enUS = new ResourceLocation(namespace, "lang/en_us.json");
            var languageResource = languageFiles.get(enUS);

            if (languageResource != null) {
                BufferedReader reader = languageResource.openAsReader();
                String content = IOUtils.toString(reader);
                reader.close();

                var groupedLanguageFiles = processor.getGroupedLanguageFiles().get(namespace);

                var excludedExistingLanguages = new ArrayList<String>();
                if (groupedLanguageFiles != null) {
                    for (ResourceLocation languageFile : groupedLanguageFiles) {
                        if (languageFile.equals(enUS)) {
                            continue;
                        }

                        String languageCode = languageFile.getPath().substring(5, languageFile.getPath().length() - 5);
                        excludedExistingLanguages.add(languageCode);
                    }
                }

                String modVersion = "unknown";

                // Try mod id = namespace?
                Optional<ModContainer> modContainer = FabricLoader.getInstance().getModContainer(namespace);

                if(modContainer.isPresent()) {
                    modVersion = modContainer.get().getMetadata().getVersion().getFriendlyString();
                } else {
                    // Clearly mod is dumb and doesn't have namespace = mod id.
                    LOGGER.warn("Mod is stupid and doesn't have namespace = mod id: " + namespace);
                }

                if(modVersion.equals("unknown")) {
                    LOGGER.warn("Mod version is unknown for namespace: " + namespace);
                } else {
                    languagePackages.add(new LanguagePackage(namespace, modVersion, content, excludedExistingLanguages.toArray(String[]::new)));
                }

            } else {
                LOGGER.warn("Didn't find en_us.json for namespace: " + namespace);
                LOGGER.warn("Something must have gone wrong during processing.");
            }
        }

        // Output languagePackages to output.json
        Files.writeString(FabricLoader.getInstance().getGameDir().resolve("output.json"), new Gson().toJson(languagePackages));
    }
}
