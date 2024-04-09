package dev.imb11.loqui.client.i18n.in;

import java.util.HashMap;

public record LanguageResponse(String namespace, String version, HashMap<String, String> contents) {
}
