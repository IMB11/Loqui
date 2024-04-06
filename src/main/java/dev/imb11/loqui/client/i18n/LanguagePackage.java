package dev.imb11.loqui.client.i18n;

/**
 * Represents the en_us file for a namespace.
 */
public record LanguagePackage(String namespace, String version, String contents, String[] excludedLanguages) {
}
