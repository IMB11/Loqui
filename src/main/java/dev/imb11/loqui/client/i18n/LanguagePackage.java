package dev.imb11.loqui.client.i18n;

/**
 * Represents the en_us file for a namespace.
 * @param namespace The namespace of the language file.
 * @param content The content of the language file.
 */
public record LanguagePackage(String namespace, String version, String content, String[] excludedLanguages) {
}
