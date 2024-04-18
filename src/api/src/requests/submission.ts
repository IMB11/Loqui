import { Request, Response } from "express";
import Submission, { getBaseLocaleHash } from "../data/submission.js";
import { LokaliseApi } from "@lokalise/node-api";
import { addHash } from "../data/hash-database.js";

export async function submitTranslationRequest(lokalise: LokaliseApi, project_id: string, req:  Request, res: Response) {
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
    if (!submission.modid || !submission.jarHash || !submission.providedLocales || !submission.baseLocaleData || !submission.jarVersion) {
      return res.status(400).send({
        message: "Each submission must have a modname, modid, jarHash, providedLocales, and baseLocaleData.",
        error: "invalid_submission"
      });
    }
  }

  // Process each submission.
  for (const submission of body) {
    // Process submission.
    let translationData: Record<string, string>;
    try {
      translationData = JSON.parse(submission.baseLocaleData);
    } catch {
      return res.status(400).send({
        message: "baseLocaleData must be a valid JSON string.",
        error: "invalid_base_locale_data"
      });
    }

    // Verify that it's in [key: string]: string format.
    if (Object.keys(translationData).some(key => typeof translationData[key] !== "string")) {
      return res.status(400).send({
        message: "baseLocaleData must be in [key: string]: string format.",
        error: "invalid_base_locale_data"
      });
    }

    const stringData = submission.baseLocaleData;

    // Verify that a file doesn't already exist with the same hash.
    const localeFileHash = getBaseLocaleHash(submission);

    const existingFile = await lokalise.files().list({
      project_id,
      filter_filename: localeFileHash
    });

    if (existingFile.items.length > 0) {
      return res.status(409).send({
        message: "A file with the same hash already exists in the project.",
        error: "file_exists"
      });
    }

    const hashSubmission = addHash(localeFileHash, submission.jarVersion);

    if (hashSubmission === null) {
      continue;
    }

    const filename = `${submission.modid}/${hashSubmission.modVersion}.json`;

    // Create the file.
    const process = await lokalise.files().upload(project_id, {
      data: Buffer.from(stringData).toString("base64"), 
      filename: filename, 
      lang_iso: "en",
      apply_tm: true, 
      format: "json", 
      skip_detect_lang_iso: true,
      distinguish_by_file: true,
      slashn_to_linebreak: true
    })

    // Process the file.
    return res.send({ processing: true });
  }

  res.send("ok");
}