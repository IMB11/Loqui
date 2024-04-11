package dev.imb11.loqui.client;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.resource.ResourceManagerHelper;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.server.packs.PackType;

public class Loqui implements ClientModInitializer {
    public static boolean HAS_REPORTED = false;
    public static String API_ROOT = "https://loqui-api.imb11.dev";

    @Override
    public void onInitializeClient() {
        if(FabricLoader.getInstance().isDevelopmentEnvironment()) {
            API_ROOT = "http://localhost:9182";
        }

        ResourceManagerHelper.get(PackType.CLIENT_RESOURCES).registerReloadListener(new LoquiReloadListener());
    }
}
