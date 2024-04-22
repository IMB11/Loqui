package dev.imb11.loqui.client.mixin;

import net.minecraft.Util;
import net.minecraft.client.gui.components.PlainTextButton;
import net.minecraft.client.gui.screens.ConfirmLinkScreen;
import net.minecraft.client.gui.screens.LanguageSelectScreen;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.network.chat.Component;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Pseudo
@Mixin(value = LanguageSelectScreen.class, priority = 5000)
public abstract class LanguageSelectScreenMixin extends Screen {
    protected LanguageSelectScreenMixin(Component component) {
        super(component);
    }

    @Inject(method = "init", at = @At("TAIL"))
    void onInit(CallbackInfo ci) {
        this.addRenderableWidget(new PlainTextButton(this.width / 2 - (this.font.width(Component.translatable("loqui.screen.help")) / 2), (int) (this.height - (this.font.lineHeight) - (0.5 * this.font.lineHeight)), 200, 20, Component.translatable("loqui.screen.help"), (button) -> {
            assert this.minecraft != null;
            ConfirmLinkScreen screen = new ConfirmLinkScreen((bl) -> {
                if (bl) {
                    Util.getPlatform().openUri("https://loqui.imb11.dev/");
                } else {

                    this.minecraft.setScreen(this);
                }
            }, "https://loqui.imb11/dev", true);
            this.minecraft.setScreen(screen);
        }, this.font));
    }
}
