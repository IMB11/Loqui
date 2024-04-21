import { Request, Response } from "express";
import Submission, { getBaseLocaleHash, getModrinthFile } from "../data/submission.js";
import { LokaliseApi, QueuedProcess } from "@lokalise/node-api";
import { addHash, Hash } from "../data/persistence.js";
import manageDuplicates from "../processes/duplicates.js";
import logger from "../logger.js";
import _ from "lodash";
import { transformLocaleArray } from "../lang_map.js";
import blacklist from "../blacklist.js";

function delay(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

const finalizationTasks: any[] = [];

setInterval(async () => {
  if (finalizationTasks.length === 0) return;
  const task = finalizationTasks.shift();
  await task();
}, 500)

// Exclude file languages.
async function excludeFileLanguages(lokalise: LokaliseApi, project_id: string, table: { [filename: string]: string[] }, modrinthTable: { [filename: string]: string | undefined }) {
  const language_isos: string[] = (await lokalise.languages().list({ project_id, limit: 500 })).items.map(lang => lang.lang_iso);

  for (const filename of Object.keys(table)) {
    let languages = table[filename];

    logger.debug(`Excluding languages for ${filename}`);
    logger.debug(languages.length === 0 ? "No languages to exclude." : `Excluding ${languages.length} languages.`)

    if (languages.length === 0) {
      continue;
    }

    languages = transformLocaleArray(languages, language_isos, project_id);
    _.remove(languages, lang => lang === "en_us");
    _.remove(languages, lang => !language_isos.includes(lang));

    const keys = await lokalise.keys().list({ limit: 5000, project_id, filter_filenames: filename, include_translations: 1 });

    let keyData = [];
    for (const key of keys.items) {
      const data = {
        key_id: key.key_id,
        translations: languages.map(lang => ({
          language_iso: lang,
          translation: "[VOID]",
          is_reviewed: true,
          is_unverified: false
        }))
      }

      if (modrinthTable[filename]) {
        data["description"] = modrinthTable[filename];
      }

      keyData.push(data);
    }

    await lokalise.keys().bulk_update({
      keys: keyData,
    }, {
      project_id
    });
    await delay(1000 / 6)
  }
}

export async function submitTranslationRequest(lokalise: LokaliseApi, project_id: string, req: Request, res: Response) {
  const body: Submission[] = req.body;

    // Validate body.
    if (!Array.isArray(body)) {
      return res.status(400).send({
        message: "Body must be an array of Submission objects.",
        error: "invalid_body"
      });
    }

    // Validate each submission.
    for (const submission of body) {
      if (!submission.namespace || !submission.jarHash || !submission.providedLocales || !submission.baseLocaleData || !submission.jarVersion) {
        return res.status(400).send({
          message: "Each submission must have a modname, modid, jarHash, providedLocales, and baseLocaleData.",
          error: "invalid_submission"
        });
      }
    }

  finalizationTasks.push(async () => {
    const fileProcessed: { [filename: string]: string[] } = {};
    const modrinthTable: { [filename: string]: string | undefined } = {};

    // Process each submission.
    let processes = [];
    for (const submission of body) {
      let namespace = submission.namespace;

      if (blacklist.includes(namespace)) {
        logger.info(`Skipping submission for ${namespace} due to blacklist.`);
        continue;
      }

      // Process submission.
      let translationData: Record<string, string>;
      try {
        translationData = JSON.parse(submission.baseLocaleData);
      } catch {
        continue;
      }

      // Verify that it's in [key: string]: string format.
      if (Object.keys(translationData).some(key => typeof translationData[key] !== "string")) {
        continue;
      }

      const stringData = submission.baseLocaleData;

      // Verify that a file doesn't already exist with the same hash.
      const localeFileHash = getBaseLocaleHash(submission);

      const existingFile = await lokalise.files().list({
        project_id,
        filter_filename: localeFileHash
      });

      if (existingFile.items.length > 0) {
        continue;
      }

      const hashSubmission: Hash = addHash(submission.namespace, localeFileHash, submission.providedLocales, submission.jarVersion);

      if (!hashSubmission) {
        continue;
      }

      logger.debug(`Processing submission for ${submission.namespace} - ${submission.jarVersion}`);

      const filename = `${submission.namespace}/${hashSubmission.jarVersion}.json`;

      while (true) {
        try {
          logger.debug(`Uploading file ${filename}`);
          const processResult = await lokalise.files().upload(project_id, {
            data: Buffer.from(stringData).toString("base64"),
            filename: filename,
            lang_iso: "en_us",
            apply_tm: true,
            format: "json",
            skip_detect_lang_iso: true,
            distinguish_by_file: true,
            convert_placeholders: false,
            slashn_to_linebreak: true,
          });
          processes.push(processResult.process_id);
          break;
        } catch (e) {
          logger.error(`Error uploading ${filename}: Probably rate-limited. Retrying in 0.5 seconds.`);
          await delay(500);
          continue;
        }
      }

      fileProcessed[filename] = submission.providedLocales;

      const modrinthData = await getModrinthFile(submission);

      if (modrinthData) {
        modrinthTable[filename] = `${modrinthData.name} - https://modrinth.com/mod/${modrinthData.project_id}`;
      }
    }

    try {
      // Wait until all relevant processes are done.
      console.log("Waiting for processes to finish... (This may take a while...)")
      while (true) {
        const processesActive = await lokalise.queuedProcesses().list({ project_id, limit: 500 });
        const incomplete = _.filter(processesActive.items, (process: QueuedProcess) => {
          return processes.includes(process.process_id) && !["finished", "failed", "cancelled"].includes(process.status);
        });

        if (incomplete.length === 0) {
          break;
        }

        await delay(1000);
      }

      logger.debug("Excluding file languages...");
      await excludeFileLanguages(lokalise, project_id, fileProcessed, modrinthTable);
      logger.debug("Managing duplicates...");
      await manageDuplicates(lokalise, project_id);
      logger.debug("Done managing duplicates.");
    } catch (e) {
      logger.error(`Error managing:`);
      logger.error(e);
    }
  });

  res.status(200).send({ status: "Your submission is being processed."})
}