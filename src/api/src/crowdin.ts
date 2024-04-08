import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import * as YAML from "js-yaml";
import { join, resolve } from "path";
import { convertLanguageCode, convertLanguageCodes } from "./lang";
import sanitize from "sanitize-filename";

const TRANSLATION_PATH = "/%original_file_name%/%file_name%/%locale%.json";
const REPO_FOLDER = resolve(__dirname, "..", "repo");
const OUTPUT_FOLDER = resolve(__dirname, "..", "repo_readonly");
const CROWDIN_CONFIG_PATH = resolve(REPO_FOLDER, "crowdin.yml");

let NEED_TO_OPTIMIZE = false;

function arrayCompare(_arr1: any[], _arr2: any[]) {
  if (
    !Array.isArray(_arr1)
    || !Array.isArray(_arr2)
    || _arr1.length !== _arr2.length
  ) {
    return false;
  }

  // .concat() to not mutate arguments
  const arr1 = _arr1.concat().sort();
  const arr2 = _arr2.concat().sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

export interface CrowdinFile {
  source: string;
  translation: string;
  excluded_target_languages?: string[];
}

export interface CrowdinConfig {
  files: CrowdinFile[]
}

export function loadConfig(): CrowdinConfig {
  if (!existsSync(CROWDIN_CONFIG_PATH)) {
    // Create directories if they don't exist.
    mkdirSync(REPO_FOLDER, { recursive: true });

    return {
      files: []
    };
  }

  return YAML.load(readFileSync(CROWDIN_CONFIG_PATH, "utf8")) as CrowdinConfig;
}

function saveConfig(config: CrowdinConfig) {
  // Sort files in the config by the size of the excluded languages array.
  config.files.sort((a, b) => {
    if (a.excluded_target_languages === undefined && b.excluded_target_languages === undefined) {
      return 0;
    }

    if (a.excluded_target_languages === undefined) {
      return -1;
    }

    if (b.excluded_target_languages === undefined) {
      return 1;
    }

    return a.excluded_target_languages.length - b.excluded_target_languages.length;
  });

  const content = YAML.dump(config);
  writeFileSync(CROWDIN_CONFIG_PATH, content, "utf8");
}

// Creates a new group folder, and returns the path to the new group.
function prepareNewGroup(config: CrowdinConfig, ignoredLanguages?: string[]): CrowdinFile {
  // Create unique group name.

  let groupName: string;
  while (true) {
    groupName = "group_" + Math.random().toString(36).substring(2, 9);
    let exists = false;

    for (const file of config.files) {
      if (file.source.replace("/*/*.json", "") === groupName) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      break;
    }
  }

  const groupPath = resolve(REPO_FOLDER, groupName);
  mkdirSync(groupPath, { recursive: true });

  const group: CrowdinFile = {
    source: `/${groupName}/*/*.json`,
    translation: TRANSLATION_PATH,
    excluded_target_languages: ignoredLanguages
  };

  if (group.excluded_target_languages === undefined || group.excluded_target_languages?.length === 0) {
    delete group.excluded_target_languages;
  }

  config.files.push(group);

  return group;
}

/**
 * @param namespace The namespace of the en_us.json language file.
 * @param version The version of the en_us.json language file.
 * @param content The content of the en_us.json language file.
 * @param excludedLanguages Languages the en_us.json file should not be translated to.
 */
export function addEntry(config: CrowdinConfig, namespace: string, version: string, content: string, excludedLanguages: string[]): void {
  // Sanitize the namespace and version strings for file paths.
  namespace = sanitize(namespace, { replacement: "_" });
  version = sanitize(version, { replacement: "_" });

  // Convert the language codes to Crowdin language codes.
  excludedLanguages = convertLanguageCodes(excludedLanguages);

  const allEqual = (arr: any[]) => arr.every((val: any) => val === arr[0]);

  // Locate group with the same ignored languages - if ignored languages is undefined, find group with no ignored languages.
  let group: CrowdinFile = undefined;

  excludedLanguages.sort();

  for (const file of config.files) {
    const excludedLanguagesFile = file.excluded_target_languages;

    if (excludedLanguages === undefined) {
      break;
    }


    if (excludedLanguagesFile === undefined && excludedLanguages === undefined) {
      group = file;
      break;
    }

    if (excludedLanguagesFile === undefined) {
      continue;
    }

    if (excludedLanguages.length !== excludedLanguagesFile.length) {
      continue;
    }

    excludedLanguagesFile.sort();
    const same = arrayCompare(excludedLanguagesFile, excludedLanguages);

    if (same) {
      group = file;
      break;
    }
  }

  // If group is not found, create a new one.
  let groupCreated: boolean = false;
  if (group === undefined) {
    groupCreated = true;
    group = prepareNewGroup(config, excludedLanguages);
  }

  const groupName = group.source.replace("/*/*.json", "");
  const groupPath = join(REPO_FOLDER, groupName);
  const filePath = join(REPO_FOLDER, groupName, namespace, `${version}.json`);

  // Write the content to the file.
  const namespacePath = join(groupPath, namespace);
  mkdirSync(namespacePath, { recursive: true });
  writeFileSync(filePath, content, "utf8");

  // Mark the config as needing to be optimized.
  if (groupCreated) {
    NEED_TO_OPTIMIZE = true;
  }
}

export function optimizeConfig(config: CrowdinConfig) {
  if (!NEED_TO_OPTIMIZE) return;

  // Merge groups with the same excluded languages into one group.
  const newConfig: CrowdinConfig = {
    files: []
  };

  // [first group, other groups with the same excluded languages]
  let duplicatePairs: [CrowdinFile, CrowdinFile[]][] = [];
  for (const group of config.files) {
    let found = false;

    for (const pair of duplicatePairs) {
      if (pair[0].excluded_target_languages === undefined && group.excluded_target_languages === undefined) {
        pair[1].push(group);
        found = true;
        break;
      }

      if (pair[0].excluded_target_languages === undefined || group.excluded_target_languages === undefined) {
        continue;
      }

      if (arrayCompare(pair[0].excluded_target_languages, group.excluded_target_languages)) {
        pair[1].push(group);
        found = true;
        break;
      }
    }

    if (!found) {
      duplicatePairs.push([group, []]);
    }
  }

  // Remove the duplicate groups that have an empty array of other groups.
  duplicatePairs = duplicatePairs.filter(pair => pair[1].length > 0);

  // Merge the groups, move all files from the duplicate groups to the first group.
  for (const pair of duplicatePairs) {
    const firstGroup = pair[0];
    const otherGroups = pair[1];

    for (const otherGroup of otherGroups) {
      const firstGroupPath = join(REPO_FOLDER, firstGroup.source.replace("/*/*.json", ""));
      const otherGroupPath = join(REPO_FOLDER, otherGroup.source.replace("/*/*.json", ""));

      // Copy files from the other group to the first group.
      cpSync(otherGroupPath, firstGroupPath, { recursive: true })

      // Remove the other group.
      config.files.splice(config.files.indexOf(otherGroup), 1);

      // Remove the other group folder.
      rmSync(otherGroupPath, { recursive: true });
    }
  }

  // Save the new config.
  saveConfig(config);
}

/**
 * Try to get the entry from the Crowdin repository.
 * @param namespace The namespace of the language file.
 * @param version The version of the language file.
 * @param requestedLanguage The language code of the requested language.
 * @returns The content of the language file, or undefined if the file does not exist.
 */
export function tryGetEntry(config: CrowdinConfig, namespace: string, version: string, requestedLanguage: string): string | undefined {
  namespace = sanitize(namespace, { replacement: "_" });
  version = sanitize(version, { replacement: "_" });

  requestedLanguage = convertLanguageCode(requestedLanguage) as string;

  if (requestedLanguage === undefined) {
    return undefined;
  }

  for (const group of config.files) {
    const groupName = group.source.replace("/*/*.json", "");
    const filePath = resolve(OUTPUT_FOLDER, groupName, namespace, version, `${requestedLanguage}.json`);

    try {
      return readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
  }

  return undefined;
}