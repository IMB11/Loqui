package dev.imb11.loqui.client.cache;

import java.util.HashMap;

public class HashManager {
    /**
     * A map of namespace to sha-512 hash of the lang/en_us.json file of said namespace.
     */
    private static final HashMap<String, String> namespaceHashes = new HashMap<>();

    public static void setHash(String namespace, String hash) {
        namespaceHashes.put(namespace, hash);
    }

    public static String getHash(String namespace) {
        return namespaceHashes.get(namespace);
    }
}
