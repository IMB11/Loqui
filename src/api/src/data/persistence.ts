import { neboa } from "neboa";

export const db = neboa(".data/db.sqlite")

export type Hash = {
  namespace: string;
  jarVersion: string;
  rootVersion?: string;
  localeFileHash?: string;
  ignoredLocales: string[];
}

export type LeaderboardInformation = {
  email: string;
  contributions: number;
}

const Leaderboard = db.collection<LeaderboardInformation>("leaderboard")
const HashStorage = db.collection<Hash>("hashStorage")

export function getAllHashes(): Hash[] {
  return HashStorage.query().find();
}

export function getLeaderboard(): LeaderboardInformation[] {
  return Leaderboard.query().find();
}

export function bumpContribution(email: string): LeaderboardInformation {
  const existing = Leaderboard.query().equalTo("email", email).first();

  if(existing) {
    existing.contributions += 1;
    Leaderboard.update(existing._id, existing);
    return existing;
  }

  return Leaderboard.insert({ email, contributions: 1 });
}

/**
 * Adds a hash to the database.
 * @param localeFileHash The hash of the locale file.
 * @param jarVersion The version of the mod - from fabric.mod.json or mods.toml
 * @returns The hash object if it was added, null if the hash already exists under the same version.
 */
export function addHash(namespace: string, localeFileHash: string, ignoredLocales: string[], jarVersion: string): Hash | null {
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
      HashStorage.insert({ namespace, jarVersion, rootVersion, ignoredLocales });

      // Hash exists, but it's a different version - so ignore it.
      return null;
    } else {
      // it is the same version, so return null.
      return null;
    }
  } else {
    // Check if hash with same jarVersion exists.
    const existingHash = HashStorage.query().equalTo("jarVersion", jarVersion).equalTo("namespace", namespace).first();

    if(existingHash) {
      let newVersion = jarVersion;
      let index = 0;
      while(HashStorage.query().equalTo("jarVersion", newVersion).equalTo("namespace", namespace).first()) {
        index++;
        newVersion = `${jarVersion}_v${index}`;
      }

      return HashStorage.insert({ namespace, jarVersion: newVersion, localeFileHash, ignoredLocales })
    }

    // Insert the hash.
    return HashStorage.insert({ namespace, jarVersion, localeFileHash, ignoredLocales });
  }
}

export function getHashObject(localeFileHash: string): Hash | null {
  return HashStorage.query().equalTo("localeFileHash", localeFileHash).first();
}

export function getHashObjectByJarVersion(namespace: string, jarVersion: string): Hash | null {
  // Check if rootVersion exists - and follow it.
  return HashStorage.query().equalTo("jarVersion", jarVersion).equalTo("namespace", namespace).first();
}