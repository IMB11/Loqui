package dev.imb11.loqui.client;

import net.fabricmc.fabric.api.resource.ModResourcePack;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.PackResources;
import net.minecraft.server.packs.PackType;
import net.minecraft.server.packs.metadata.MetadataSectionSerializer;
import net.minecraft.server.packs.repository.PackRepository;
import net.minecraft.server.packs.resources.IoSupplier;
import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Set;

public class LoquiResourcePack implements PackResources {
    @Nullable
    @Override
    public IoSupplier<InputStream> getRootResource(String... strings) {
        Path cacheDirectory = LoquiReloadListener.CACHE_DIR;
        if (cacheDirectory.toFile().exists()) {
            return IoSupplier.create(cacheDirectory);
        }

        return null;
    }

    @Nullable
    @Override
    public IoSupplier<InputStream> getResource(PackType packType, ResourceLocation resourceLocation) {
        return null;
    }

    @Override
    public void listResources(PackType packType, String string, String string2, ResourceOutput resourceOutput) {

    }

    @Override
    public Set<String> getNamespaces(PackType packType) {
        return null;
    }

    @Nullable
    @Override
    public <T> T getMetadataSection(MetadataSectionSerializer<T> metadataSectionSerializer) throws IOException {
        return null;
    }

    @Override
    public String packId() {
        return null;
    }

    @Override
    public void close() {

    }
}
