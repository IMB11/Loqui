package dev.imb11.loqui.client.i18n;

import net.minecraft.resources.ResourceLocation;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;

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

                var missing = missingLanguages.get(namespace).toArray(new String[0]);
                languagePackages.add(new LanguagePackage(namespace, content, missing));
            } else {
                LOGGER.warn("Didn't find en_us.json for namespace: " + namespace);
                LOGGER.warn("Something must have gone wrong during processing.");
            }
        }
    }
}
