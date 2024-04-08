package dev.imb11.loqui.client;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.mojang.authlib.minecraft.client.MinecraftClient;
import dev.imb11.loqui.client.i18n.in.LoquiDownloader;
import dev.imb11.loqui.client.i18n.out.LoquiPackager;
import dev.imb11.loqui.client.i18n.out.LoquiProcessor;
import net.fabricmc.fabric.api.resource.IdentifiableResourceReloadListener;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.client.Minecraft;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.Resource;
import net.minecraft.server.packs.resources.ResourceManager;
import net.minecraft.server.packs.resources.ResourceManagerReloadListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

public class LoquiReloadListener implements ResourceManagerReloadListener, IdentifiableResourceReloadListener {
    private static final Logger LOGGER = LoggerFactory.getLogger("LoquiReloadListener");
    public static final Path CACHE_DIR = FabricLoader.getInstance().getGameDir().resolve(".loqui_cache");
    @Override
    public void onResourceManagerReload(ResourceManager resourceManager) {
        Map<ResourceLocation, Resource> languageFiles = resourceManager.listResources("lang", (resourceLocation) -> resourceLocation.getPath().endsWith(".json"));

        // Remove any language files that exist in a namespace that has namespace:noloqui.txt present.
        var keyset = languageFiles.keySet();
        for (String namespace : resourceManager.getNamespaces()) {
            ResourceLocation noloqui = new ResourceLocation(namespace, "noloqui.txt");
            if (resourceManager.getResource(noloqui).isPresent()) {
                LOGGER.info("Removing namespace " + namespace + " from indexing as requested.");
                keyset.removeIf(resourceLocation -> resourceLocation.getNamespace().equals(namespace));
            }
        }

        LoquiProcessor processor = new LoquiProcessor(languageFiles);
        try {
            LoquiPackager packager = new LoquiPackager(processor);
            LOGGER.info("Packaged " + packager.languagePackages.size() + "/" + FabricLoader.getInstance().getAllMods().size() + " language files successfully.");
            packager.send();

            LoquiDownloader downloader = new LoquiDownloader(processor);
            downloader.recieve();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


    }

    @Override
    public ResourceLocation getFabricId() {
        return new ResourceLocation("loqui", "reload_listener");
    }
}
