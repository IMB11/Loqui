package dev.imb11.loqui.client;

import com.google.common.base.Charsets;
import dev.imb11.loqui.client.cache.CacheManager;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.SharedConstants;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.AbstractPackResources;
import net.minecraft.server.packs.PackResources;
import net.minecraft.server.packs.PackType;
import net.minecraft.server.packs.metadata.MetadataSectionSerializer;
import net.minecraft.server.packs.metadata.pack.PackMetadataSection;
import net.minecraft.server.packs.resources.IoSupplier;
import org.apache.commons.io.IOUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * Credits to:
 * - CrowdinTranslate for the general gist of how to make a built in resource pack load from external folders.
 * - fabric-resource-loader-v0 for the metadata section stuff.
 */
public class LoquiResourcePack implements PackResources {
    private static final Logger LOGGER = LoggerFactory.getLogger("Loqui/ResourcePack");

    @Nullable
    @Override
    public IoSupplier<InputStream> getRootResource(String... strings) {
        String fileName = String.join("/", strings);
        if ("pack.mcmeta".equals(fileName)) {
            String description = "loqui.pack.description";
            String fallback = "Free, open-source, and community-driven translations for ALL Minecraft mods.";
            String pack = String.format("{\"pack\":{\"pack_format\":" + SharedConstants.getCurrentVersion().getPackVersion(PackType.CLIENT_RESOURCES) + ",\"description\":{\"translate\":\"%s\",\"fallback\":\"%s.\"}}}", description, fallback);
            return () -> IOUtils.toInputStream(pack, Charsets.UTF_8);
        } else if ("pack.png".equals(fileName)) {
            return FabricLoader.getInstance().getModContainer("loqui")
                    .flatMap(container -> container.getMetadata().getIconPath(512).flatMap(container::findPath))
                    .map(path -> (IoSupplier<InputStream>) (() -> Files.newInputStream(path)))
                    .orElse(null);
        }

        Path cacheDirectory = LoquiReloadListener.CACHE_DIR;
        if (cacheDirectory.toFile().exists()) {
            return IoSupplier.create(cacheDirectory);
        }

        return null;
    }

    @Nullable
    @Override
    public IoSupplier<InputStream> getResource(PackType packType, ResourceLocation resourceLocation) {
        return this.getRootResource(packType.getDirectory() + "/" + resourceLocation.getNamespace() + "/" + resourceLocation.getPath());
    }

    @Override
    public void listResources(PackType packType, String namespace, String path, ResourceOutput resourceOutput) {
        String start = CacheManager.CACHE_DIR + "/assets/" + namespace + "/" + path;
        String[] files = new File(start).list();

        if (files == null || files.length == 0) {
            return;
        }

        List<ResourceLocation> resultList = Arrays.stream(files)
                .map(file -> new ResourceLocation(namespace, path + "/" + file))
                .toList();

        for(ResourceLocation result : resultList) {
            resourceOutput.accept(result, getResource(packType, result));
        }
    }

    @Override
    public @NotNull Set<String> getNamespaces(PackType packType) {
        return CacheManager.getCachedNamespaces();
    }

    @Nullable
    @Override
    public <T> T getMetadataSection(MetadataSectionSerializer<T> metadataSectionSerializer) throws IOException {
        IoSupplier<InputStream> inputSupplier = this.getRootResource("pack.mcmeta");

        if (inputSupplier != null) {
            try (InputStream input = inputSupplier.get()) {
                return AbstractPackResources.getMetadataFromStream(metadataSectionSerializer, input);
            }
        } else {
            return null;
        }
    }

    @Override
    public String packId() {
        return "loqui";
    }

    @Override
    public void close() {}

    @Override
    public boolean isBuiltin() {
        return false;
    }
}
