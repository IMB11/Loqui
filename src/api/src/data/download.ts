import { LokaliseApi } from "@lokalise/node-api";
import { getAllHashes } from "./persistence.js";
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { Extract } from "unzipper";
import logger from "../logger.js";
import _ from "lodash";
import { glob, globSync } from "glob";

export let downloadLock = false;

function delay(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

export async function download(language_isos: string[], project_id: string, lokalise: LokaliseApi) {
  if (downloadLock) return;
  downloadLock = true;

  if (existsSync("./repo")) {
    logger.info("Cleaning up old translations...");
    rmSync("./repo", { recursive: true });
    logger.info("Old translations cleaned up.");
  }

  if (existsSync("./temp")) {
    logger.info("Cleaning up old temp files...");
    rmSync("./temp", { recursive: true });
    logger.info("Old temp files cleaned up.");
  }

  logger.info("Downloading translations...");
  const hashObjs = getAllHashes();

  logger.debug(`Recieved ${hashObjs.length} hash objects.`);

  const downloadPromises: string[] = hashObjs.map((hashObj) => {
    const filename = `${hashObj.namespace}/${hashObj.jarVersion}.json`;
    return filename;
  });

  const downloadChunks = _.chunk(downloadPromises, 10);

  logger.info(`Downloading ${downloadPromises.length} files in ${downloadChunks.length} chunks...`);

  let chunkNumber = 1;

  mkdirSync("./temp", { recursive: true });
  mkdirSync("./repo", { recursive: true });

  for (const chunk of downloadChunks) {
    logger.info(`Downloading chunk[${chunkNumber}] of ${chunk.length} files...`);
    chunkNumber++;
    const result = await lokalise.files().download(project_id, {
      format: "json",
      filter_filenames: chunk,
      export_empty_as: "skip",
      placeholder_format: "printf"
    });

    if (result.bundle_url) {
      try {
        // Download bundle into temp folder and extract it into `./repo` folder, preserving the directory structure.
        const targetPath = `./temp/download-result.zip`;
        const data = await fetch(result.bundle_url).then(res => res.arrayBuffer());

        writeFileSync(targetPath, Buffer.from(data));

        // Extract zip into `./repo` folder.
        const readStream = createReadStream(`./temp/download-result.zip`).pipe(Extract({ path: `./repo` }));
      } catch {
        continue;
      }
    }
  }

  // Validate all JSON files in the `./repo` folder - delete if invalid.
  const globResult = globSync(`./repo/**/**/*.json`);

  logger.info(`Validating ${globResult.length} JSON files...`)

  globResult.map(value => {
    const fileContents = readFileSync(value, "utf-8");
    try {
      const content = JSON.parse(fileContents);
      for (const key of Object.keys(content)) {
        // Delete empty keys.
        if (content[key] === "") {
          delete content[key];
        }
      }

      if (Object.keys(content).length === 0) {
        logger.warn(`File ${value} is empty. Deleting.`);
        rmSync(value);
      } else {
        writeFileSync(value, JSON.stringify(content, null, 2));
      }
    } catch (e) {
      logger.error(`File ${value} is not valid JSON. Deleting.`);
      rmSync(value);
    }
    return;
  })

  logger.info("Translations downloaded.");

  downloadLock = false;
}