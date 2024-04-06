# Loqui

Loqui is a simple mod that collects all the `en_us.json` translations provided by all mods installed - it then sends it off to an API, where it is processed and uploaded to Crowdin, ready to translate.

Once the translations are complete (by actual people!), Loqui will download them and apply them to your game, so you can play with all the mods you love in your own language!

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
    3. Once translated, Crowdin resyncs with the repository, and a pull request to the `main` branch of the translations repository is made.
    4. This pull request will be merged by either me or a verified proofreader to ensure the translation file format is correct.
6. When the Loqui mod requests translations, it will download the translations from the API and apply them to the game.
    1. Only the translations for the mods installed will be downloaded.

## Benefits

- **Crowdsourced translations** - Get your mod translated by the community for free, all translations are moderated by verified proofreaders.
- **Automatic updates** - No need to manually update translations, Loqui will do it for you.
- **Ability to download translations** - You can download the translations from Crowdin and bundle them directly in your mod if you wish.

## Installation

The eventual goal of Loqui is to be cross-platform and cross-version, currently it is on `1.20.1` for Fabric for debugging purposes. Once the mod is stable, it will be ported to NeoForge and Forge for as many versions as possible.

## Opt-out

Opting out can be useful if:

- You already provide crowd-sourced translations.
- You have a custom translation system.
- You don't want your mod to be translated.

If you wish to opt-out of Loqui, you can do so by adding a `noloqui.txt` file to your mod's assets.

Eg: `assets/namespace/noloqui.txt` would disable loqui for any language files within the `namespace` namespace.