package dev.imb11.loqui.client.i18n;

import java.util.regex.Pattern;
import java.util.HashSet;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Map;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.Resource;

/**
 * The LoquiProcessor class is responsible for gathering and processing language files ready to be uploaded to the public Crowdin language repository.
 */
public class LoquiProcessor {
    private final Map<ResourceLocation, Resource> languageFiles;
    private final Pattern compiledRegex;
    private final HashSet<String> minecraftSupportedLanguageCodes;
    private final HashMap<String, ArrayList<ResourceLocation>> groupedLanguageFiles;
    private final HashMap<String, ArrayList<String>> filteredMissingLanguages;

    /**
     * Constructs a new LoquiProcessor.
     *
     * @param languageFiles A map containing language files, with ResourceLocation as keys and Resource as values.
     */
    public LoquiProcessor(Map<ResourceLocation, Resource> languageFiles) {
        this.languageFiles = languageFiles;
        this.compiledRegex = Pattern.compile("^(loqui|minecraft|fabric(-.*-v\\d+)?)$");
        this.minecraftSupportedLanguageCodes = new HashSet<>();
        this.groupedLanguageFiles = new HashMap<>();
        this.filteredMissingLanguages = new HashMap<>();

        processLanguageFiles();
    }

    /**
     *  Performs the core processing for the LoquiProcessor. This includes filtering language files,
     *  grouping them by namespace, and identifying missing languages.
     */
    private void processLanguageFiles() {
        filterLanguageFiles();
        groupLanguageFiles();
        findMissingLanguages();
    }

    /**
     *  Filters the languageFiles map, removing language files with namespaces that don't match the
     *  compiledRegex pattern. Also extracts supported language codes from the 'minecraft' namespace.
     */
    private void filterLanguageFiles() {
        HashMap<ResourceLocation, Resource> filteredLanguageFiles = new HashMap<>();

        for (ResourceLocation key : languageFiles.keySet()) {
            if (key.getNamespace().equals("minecraft")) {
                // minecraft:lang/en_us.json -> en_us
                String languageCode = key.getPath().substring(5, key.getPath().length() - 5);
                minecraftSupportedLanguageCodes.add(languageCode);
            }

             if (!compiledRegex.matcher(key.getNamespace()).matches()) {
                 filteredLanguageFiles.put(key, languageFiles.get(key));
             }
        }

        this.languageFiles.clear(); 
        this.languageFiles.putAll(filteredLanguageFiles); 
    }

    /**
     * Groups language files in the languageFiles map based on their namespace.
     */
    private void groupLanguageFiles() {
        for (ResourceLocation key : this.languageFiles.keySet()) {
            String namespace = key.getNamespace();

            if (!groupedLanguageFiles.containsKey(namespace)) {
                groupedLanguageFiles.put(namespace, new ArrayList<ResourceLocation>());
            }

            groupedLanguageFiles.get(namespace).add(key);
        }
    }

    /**
     * Identifies missing language files for each mod (namespace). Uses 'en_us' as a reference language
     * and filters out mods that don't have an 'en_us' language file therefore making them incompatible with the Crowdin setup.
     */
    private void findMissingLanguages() {
        HashMap<String, ArrayList<String>> groupedMissingLanguages = new HashMap<String, ArrayList<String>>();
        for (String languageCode : minecraftSupportedLanguageCodes) {
            for (String namespace : groupedLanguageFiles.keySet()) {
                if (!groupedLanguageFiles.get(namespace).contains(new ResourceLocation(namespace, "lang/" + languageCode + ".json"))) {
                    if (!groupedMissingLanguages.containsKey(namespace)) {
                        groupedMissingLanguages.put(namespace, new ArrayList<>());
                    }

                    groupedMissingLanguages.get(namespace).add(languageCode);
                }
            }
        }

        for (String namespace : groupedMissingLanguages.keySet()) {
            if (!groupedMissingLanguages.get(namespace).contains("en_us")) {
                this.filteredMissingLanguages.put(namespace, groupedMissingLanguages.get(namespace));
            }
        }
    }

    public Map<ResourceLocation, Resource> getLanguageFiles() {
        return languageFiles;
    }

    public HashMap<String, ArrayList<ResourceLocation>> getGroupedLanguageFiles() {
        return groupedLanguageFiles;
    }

    public HashMap<String, ArrayList<String>> getFilteredMissingLanguages() {
        return filteredMissingLanguages;
    }
}
