import { LokaliseApi } from "@lokalise/node-api";
import { Request, Response } from "express";
import { getHashObject, Hash } from "../data/persistence.js";
import { safeParseLocale, transformLocaleArray } from "../lang_map.js";
import { existsSync, readFileSync } from "fs";
import _ from "lodash";

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

  const files: { filePath: string, hashObj: Hash }[] = [];
  // Retrieve translations.
  for (const localeHash of data) {
    const hashObj = getHashObject(localeHash);
    const filename = `${hashObj.namespace}/${hashObj.jarVersion}.json`;

    const ignoredLanguages = transformLocaleArray(hashObj.ignoredLocales, language_isos, project_id);

    // Invert to get the languages to retrieve.
    const languages = language_isos.filter(lang => !ignoredLanguages.includes(lang));

    for (const lang of languages) {
      files.push({
        filePath: `./repo/${filename}/${lang}.json`,
        hashObj
      });
    }
  }

  const translationFiles = await Promise.all(files.map(async file => {
    const path = file.filePath;
    if(existsSync(file.filePath)) {
      return {
        file,
        data: JSON.parse(readFileSync(file.filePath, "utf-8"))
      };
    }
    return {
      hashObj: file.hashObj,
      data: undefined
    };
  }));

  _.remove(translationFiles, file => file.data === undefined);

  res.send(translationFiles);
}