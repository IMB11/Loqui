# Loqui

The goal of Loqui is to provide free, open-source, and community-driven translations for ALL Minecraft mods.

The main benefit of Loqui is that mod developers can get their mods translated into multiple languages for free, without having to manually manage translations - Loqui allows mod developers to download any completed translations and bundle them directly into their mods!

Loqui supports all Fabric mods, and is designed to be as easy to use as possible. It supports versioning, so if a mod changes its translation keys, Loqui will automatically manage the translations for each version.

*A NeoForge port is planned, but the current goal is to smooth out any significant bugs and issues that may happen.*

**Loqui is currently in development and is not yet ready for production use.**

## Want To Help Translate?

Join the Crowdin Project: https://crowdin.com/project/loqui-moddedmc

Anyone can translate, but please be aware that **translations are moderated by verified proofreaders**. If you would like to become a verified proofreader, please join the [Discord](https://discord.imb11.dev/) and ask in the `#translator-chat` channel.

## Technical Explanation

1. Loqui will look for all translations loaded by mods.
2. It will note down what languages have already been translated for each mod.
3. It will send the `en_us.json` files to an API alongside information about the mod:
    1. Mod ID
    2. Mod Version
    3. Already Translated Languages
4. The API will then organise the translations and upload them to Crowdin by pushing them to the [Loqui-Translations](https://github.com/IMB11/loqui-translations) repository.
5. Once the repository has synced with Crowdin (every hour), the community can create translations.
    1. The translations are moderated by verified proofreaders.
    2. Cross-version translations are possible - a translation key can have multiple translations for different versions if needed.
    3. Once translated, Crowdin re-syncs with the repository, and when the API receives a translation download request, the translations are downloaded from the synchronized repository.
6. When the Loqui mod requests translations, it will download the translations from the API and apply them to the game.
    1. Only the translations for the mods installed will be downloaded.

## Benefits

- **Crowdsourced translations** - Get your mod translated by the community for free, all translations are moderated by verified proofreaders.
- **Automatic updates** - No need to manually update translations, Loqui will do it for you.
- **Ability to download translations** - You can download the translations from Crowdin and bundle them directly in your mod if you wish.

## What About Licenses?

This has been debated quite a bit, and the consensus is that translation files are designed to be edited and redistributed, therefore this is a case where licenses should not really apply.

*If you feel that your mod's translations should not be crowd-sourced, you can opt-out of Loqui by adding a `noloqui.txt` file to your mod's assets or contacting me directly for any stronger measures.*

## Installation

Loqui is available for Fabric 1.19.4 to 1.20.4 - it is not available for NeoForge yet as mentioned above.

- Modrinth: https://modrinth.com/mod/loqui
- CurseForge: https://www.curseforge.com/minecraft/mc-mods/loqui

## Opt-out

Opting out can be useful if:

- You already provide crowd-sourced translations.
- You have a custom translation system.
- You don't want your mod to be translated.

If you wish to opt-out of Loqui, you can do so by adding a `noloqui.txt` file to your mod's assets.

Eg: `assets/namespace/noloqui.txt` would disable loqui for any language files within the `namespace` namespace.

If you wish to have your mod removed from Loqui entirely - including any `en_us.json` files that have been pre-indexed, please contact me directly.