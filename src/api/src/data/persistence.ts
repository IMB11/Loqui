import { neboa } from "neboa";

export const db = neboa(".data/db.sqlite")

export type Hash = {
  namespace: string;
  jarVersion: string;
  rootVersion?: string;
  localeFileHash?: string;
}

const HashStorage = db.collection<Hash>("hashStorage")

/**
 * Adds a hash to the database.
 * @param localeFileHash The hash of the locale file.
 * @param jarVersion The version of the mod - from fabric.mod.json or mods.toml
 * @returns The hash object if it was added, null if the hash already exists under the same version.
 */
export function addHash(namespace: string, localeFileHash: string, jarVersion: string): Hash | null {
  // Check if hash is already in the database.
  const existingHash = HashStorage.query().equalTo("localeFileHash", localeFileHash).first();

  // Check if the hash is the same.
  if (existingHash && existingHash.localeFileHash === localeFileHash) {
    return null;
  }

  if(existingHash) {
    // Check if jarVersion is equal - if it's not, make a new link entry using the rootVersion.
    if(existingHash.jarVersion !== jarVersion) {
      const rootVersion = existingHash.jarVersion;
      HashStorage.insert({ namespace, jarVersion, rootVersion });

      // Hash exists, but it's a different version - so ignore it.
      return null;
    } else {
      // it is the same version, so return null.
      return null;
    }
  } else {
    // Insert the hash.
    return HashStorage.insert({ namespace, jarVersion, localeFileHash });
  }
}