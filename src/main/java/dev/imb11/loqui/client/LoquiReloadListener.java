package dev.imb11.loqui.client;

import dev.imb11.loqui.client.i18n.LanguagePackage;
import dev.imb11.loqui.client.i18n.LoquiPackager;
import dev.imb11.loqui.client.i18n.LoquiProcessor;
import net.fabricmc.fabric.api.resource.IdentifiableResourceReloadListener;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.Resource;
import net.minecraft.server.packs.resources.ResourceManager;
import net.minecraft.server.packs.resources.ResourceManagerReloadListener;

import java.io.IOException;
import java.util.Map;

public class LoquiReloadListener implements ResourceManagerReloadListener, IdentifiableResourceReloadListener {
    @Override
    public void onResourceManagerReload(ResourceManager resourceManager) {
        Map<ResourceLocation, Resource> languageFiles = resourceManager.listResources("lang", (resourceLocation) -> resourceLocation.getPath().endsWith(".json"));

        LoquiProcessor processor = new LoquiProcessor(languageFiles);
        try {
            LoquiPackager packager = new LoquiPackager(processor);

            for (LanguagePackage languagePackage : packager.languagePackages) {
                System.out.println(languagePackage.namespace() + " - " + languagePackage.content().length() + " bytes");
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResourceLocation getFabricId() {
        return new ResourceLocation("loqui", "reload_listener");
    }
}
