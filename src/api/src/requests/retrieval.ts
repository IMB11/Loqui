import { LokaliseApi } from "@lokalise/node-api";
import { Request, Response } from "express";
import { getHashObject, Hash } from "../data/persistence.js";
import { reverseFallbacks, safeParseLocale, transformLocaleArray } from "../lang_map.js";
import { existsSync, readFileSync } from "fs";
import _, { reverse } from "lodash";
import logger from "../logger.js";
import { globSync } from "glob";

type RetrievalRequest = string[];

export async function retrieveTranslations(lokalise: LokaliseApi, project_id: string, req: Request, res: Response) {
  const data: RetrievalRequest = req.body;

  // Verify body.
  if (!Array.isArray(data)) {
    return res.status(400).send({
      message: "Body must be an array of strings.",
      error: "invalid_body"
    });
  }

  // Verify they're all strings.
  if (data.some(locale => typeof locale !== "string")) {
    return res.status(400).send({
      message: "Each element in the body must be a string.",
      error: "invalid_body"
    });
  }

  const language_isos: string[] = (await lokalise.languages().list({ project_id, limit: 500 })).items.map(lang => lang.lang_iso);

  const files: { filePath: string[], hashObj: Hash }[] = [];

  logger.info(`Retrieving translations for ${data.length} mods.`);

  // Retrieve translations.
  for (const localeHash of data) {
    const hashObj = getHashObject(localeHash);

    if(!hashObj) {
      logger.warn(`Hash object not found for ${localeHash}.`);
      continue;
    }
    
    logger.info(`Retrieving translations for ${hashObj.namespace}-${hashObj.jarVersion}.json`)

    const globResult = globSync(`./repo/**/${hashObj.namespace}/${hashObj.jarVersion}.json`);

    // For each globResult, check if the translation file has the same number of keys as the root ./repo/en_us/<namespace>/<version>.json file.
    // If not, remove the file from the list.
    const baseData = JSON.parse(readFileSync(`./repo/en_us/${hashObj.namespace}/${hashObj.jarVersion}.json`, "utf-8"));
    let filesToRemove = [];
    for(const path of globResult) {
      const data = JSON.parse(readFileSync(path, "utf-8"));
      if(Object.keys(data).length !== Object.keys(baseData).length) {
        logger.warn(`File ${path} has a different number of keys than the base translation file. Ignoring.`);
        filesToRemove.push(path);
      }
    }

    _.remove(globResult, path => filesToRemove.includes(path));

    if(globResult.length === 0) {
      logger.error(`No file found for ${hashObj.namespace}-${hashObj.jarVersion}.json`);
      continue;
    }

    files.push({
      filePath: globResult,
      hashObj
    });
  }

  const translationFiles = await Promise.all(files.map(async file => {
    const paths = file.filePath;
    const result: { hashObj: Hash, localeSet: { [locale: string]: string } } = {
      hashObj: file.hashObj,
      localeSet: {},
    };

    for (const path of paths) {
      if(existsSync(path)) {
        const data = JSON.parse(readFileSync(path, "utf-8"));

        const locale = path.split("/")[1]  // Get locale from path. (repo/<locale>/namespace/version.json) -> <locale>
        result.localeSet[locale] = data;

        // Also provide dialects.
        const dialects: string[] = reverseFallbacks[locale];
        if(dialects) {
          for(const dialect of dialects) {
            result.localeSet[dialect] = data;
          }
        }
      }
    }

    return result;
  }));

  _.remove(translationFiles, file => Object.keys(file.localeSet).length === 0);

  res.send(translationFiles);
}