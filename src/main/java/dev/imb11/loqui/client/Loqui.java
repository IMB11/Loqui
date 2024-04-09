package dev.imb11.loqui.client;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.resource.ResourceManagerHelper;
import net.minecraft.server.packs.PackType;

public class Loqui implements ClientModInitializer {
    public static boolean HAS_REPORTED = false;

    @Override
    public void onInitializeClient() {
        ResourceManagerHelper.get(PackType.CLIENT_RESOURCES).registerReloadListener(new LoquiReloadListener());
    }
}
