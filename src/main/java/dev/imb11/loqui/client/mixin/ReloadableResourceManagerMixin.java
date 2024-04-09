package dev.imb11.loqui.client.mixin;

import dev.imb11.loqui.client.LoquiResourcePack;
import net.minecraft.server.packs.PackResources;
import net.minecraft.server.packs.PackType;
import net.minecraft.server.packs.resources.ReloadableResourceManager;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyArg;

import java.util.ArrayList;
import java.util.List;

@Mixin(ReloadableResourceManager.class)
public abstract class ReloadableResourceManagerMixin {
    @Shadow
    @Final
    private PackType type;

    @ModifyArg(
            method = "createReload",
            at = @At(value = "INVOKE", target = "Lnet/minecraft/server/packs/resources/MultiPackResourceManager;<init>(Lnet/minecraft/server/packs/PackType;Ljava/util/List;)V"),
            index = 1
    )
    private List<PackResources> onPostReload(List<PackResources> packs) {
        if (this.type != PackType.CLIENT_RESOURCES)
            return packs;

        List<PackResources> list = new ArrayList<>(packs);
        // Place loqui at top of list.
        list.add(0, new LoquiResourcePack());
        return list;
    }
}