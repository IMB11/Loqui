package dev.imb11.loqui.client.i18n;

import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.ModContainer;
import org.jetbrains.annotations.Nullable;

import java.util.Optional;

public class Util {
    public static @Nullable String getVersionFromNamespace(String namespace) {
        Optional<ModContainer> modContainer = FabricLoader.getInstance().getModContainer(namespace);

        if(modContainer.isPresent()) {
            return modContainer.get().getMetadata().getVersion().getFriendlyString();
        } else {
            // try backup method
        }

        return null;
    }
}
