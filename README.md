### **_Loqui depends on community contributions, please help us translate at [Loqui's Translation Project](https://loqui.imb11.dev/)_**

[![](/lokalise_badge.png)](https://lokalise.com/solutions/for-managers)

# Loqui

The goal of Loqui is to provide free, open-source, and community-driven translations for ALL Minecraft mods.

*A NeoForge port is planned, but the current goal is to smooth out any significant bugs and issues that may happen.*

## For Users

Simply drop Loqui into your mods folder, and it will download any translations you need from the Loqui API, it's that simple!

## For Modpack Developers

Again, include Loqui in your modpack and you can allow your users to play in their native language!

It's recommended you encourage your community to join the [Translation Project](https://loqui.imb11.dev/) in order to improve the quality and quantity of translations - the more the merrier!

### Badges:
**Loqui Badges by [rotgruengelb](https://github.com/rotgruengelb):**
> [![Dark Looqui Badge](https://raw.githubusercontent.com/rotgruengelb/some-badges/46c46090db41c2bea2b1e864c32702e6c9a2adb0/Loqui/loqui_badges-dark/cozy_vector.svg)](https://github.com/rotgruengelb/some-badges/tree/main/Loqui/loqui_badges-dark) [![Loqui Badge](https://raw.githubusercontent.com/rotgruengelb/some-badges/46c46090db41c2bea2b1e864c32702e6c9a2adb0/Loqui/loqui_badges/cozy_vector.svg)](https://github.com/rotgruengelb/some-badges/tree/main/Loqui/loqui_badges)
>
> [(More Alternate Badges here)](https://github.com/rotgruengelb/some-badges/tree/main/Loqui)

## For Mod Developers

A system is currently being developed that will allow mod developers to download translations from the Loqui API and bundle them directly into their mods.

Loqui has an intelligent algorithm that allows translations to be accurate across versions, and ignore any existing translations your mod may provide!

## Benefits

- **Crowdsourced translations** - Get your mod translated by the community for free, all translations are moderated by verified proofreaders.
- **Automatic updates** - No need to manually update translations, Loqui will do it for you.
- **Ability to download translations** - You can download the translations from Crowdin and bundle them directly in your mod if you wish.

## Technical Explanation

- Loqui traverses your mods folder, gathering information on mods and what `en_us.json` files are present.
- It then sends this information to the Loqui API, which returns any translations that are available, and indexes any new unrecognized `en_us.json` files it recieves so that the community can translate them.
- Loqui then downloads these translations and places them in the correct location.

For more information, visit the [Loqui Website](https://loqui.imb11.dev/).

## Opt-out

Opting out can be useful if:

- You already provide crowd-sourced translations.
- You have a custom translation system.
- You don't want your mod to be translated.

If you wish to opt-out of Loqui, you can do so by adding a `noloqui.txt` file to your mod's resources directory.

Eg: `assets/namespace/noloqui.txt` would disable loqui for any language files within the `namespace` namespace.

If you wish to have your mod removed from Loqui entirely - including any `en_us.json` files that have been pre-indexed, please contact me directly.
