### **_Loqui depends on community contributions, please help us translate at [Loqui's Crowdin Project](https://crowdin.com/project/loqui-moddedmc)_**

# Loqui

The goal of Loqui is to provide free, open-source, and community-driven translations for ALL Minecraft mods.

*A NeoForge port is planned, but the current goal is to smooth out any significant bugs and issues that may happen.*

## For Users

Simply drop Loqui into your mods folder, and it will download any translations you need from the Loqui API, it's that simple!

## For Modpack Developers

Again, include Loqui in your modpack and you can allow your users to play in their native language!

It's recommended you encourage your community to join the [Loqui Crowdin Project](https://crowdin.com/project/loqui-moddedmc/) in order to improve the quality and quantity of translations - the more the merrier!

## For Mod Developers

As a mod developer, you are extremely welcome to download any completed translations from Loqui's [Translation Repository](https://github.com/mineblock11/loqui-translations/tree/output) and bundle them with your mod. 

Loqui has an intelligent algorithm that allows translations to be accurate across versions, and ignore any existing translations your mod may provide!

![The Crowdin Translation Editor](https://cdn.modrinth.com/data/cached_images/c458c9197691a2839356db8c10d87268f5fd01d7.png)

## Benefits

- **Crowdsourced translations** - Get your mod translated by the community for free, all translations are moderated by verified proofreaders.
- **Automatic updates** - No need to manually update translations, Loqui will do it for you.
- **Ability to download translations** - You can download the translations from Crowdin and bundle them directly in your mod if you wish.

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
    1. Only the translations for the mods installed (taking into account versions and what translations exist locally) will be downloaded.

## What About Licenses?

- **Translation files aren't protected by copyright:** The en_us.json files, which contain language data, aren't considered creative works and don't fall under typical copyright protection.
- **Translation files are meant for modification:** Their purpose is to be edited and changed to provide translations for different languages. This intended use implies that they can be redistributed as part of that process.
- **Loqui's actions are distinct from intellectual property theft:** The process Loqui uses doesn't involve extracting copyrighted assets like textures or sounds from mods. It focuses solely on the language files, which have a different legal standing.

*If you feel that your mod's translations should not be crowd-sourced, you can opt-out of Loqui by adding a `noloqui.txt` file to your mod's assets or contacting me directly for any stronger measures.*

## Opt-out

Opting out can be useful if:

- You already provide crowd-sourced translations.
- You have a custom translation system.
- You don't want your mod to be translated.

If you wish to opt-out of Loqui, you can do so by adding a `noloqui.txt` file to your mod's assets.

Eg: `assets/namespace/noloqui.txt` would disable loqui for any language files within the `namespace` namespace.

If you wish to have your mod removed from Loqui entirely - including any `en_us.json` files that have been pre-indexed, please contact me directly.
