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

  const downloadChunksInParallel = async (chunks: string[][]) => {
    const maxRetries = 3;
  
    const fetchWithRetry = async (url: string, retries: number): Promise<ArrayBuffer> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
          return await response.arrayBuffer();
        } catch (error) {
          if (attempt === retries) throw error;
          logger.warn(`Retrying fetch attempt ${attempt} for URL ${url}...`);
        }
      }
    };
  
    const downloadWithRetry = async (project_id: string, chunk: string[], retries: number): Promise<void> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await lokalise.files().download(project_id, {
            format: "json",
            filter_filenames: chunk,
            export_empty_as: "skip",
            placeholder_format: "printf"
          });
  
          if (result.bundle_url) {
            const targetPath = `./temp/download-result-${attempt}.zip`;
            const data = await fetchWithRetry(result.bundle_url, retries);
            writeFileSync(targetPath, Buffer.from(data));
  
            // Extract zip into `./repo` folder.
            const readStream = createReadStream(targetPath).pipe(Extract({ path: `./repo` }));
            return; // Exit if successful
          }
        } catch (error) {
          if (attempt === retries) {
            logger.error(`Failed to download or extract chunk after ${retries} attempts:`, error);
            throw error;
          } else {
            logger.warn(`Retrying download attempt ${attempt} for chunk...`);
          }
        }
      }
    };
  
    let chunkNumber = 1;
  
    for (let i = 0; i < chunks.length; i += 5) {
      const chunkGroup = chunks.slice(i, i + 5);
  
      await Promise.all(chunkGroup.map(async (chunk, index) => {
        const currentChunkNumber = chunkNumber + index;
        logger.info(`Downloading chunk[${currentChunkNumber}] of ${chunk.length} files...`);
        
        try {
          await downloadWithRetry(project_id, chunk, maxRetries);
        } catch (error) {
          logger.error(`Failed to process chunk[${currentChunkNumber}] after ${maxRetries} attempts`);
        }
      }));
  
      chunkNumber += chunkGroup.length;
    }
  };
  
  // Example usage
  await downloadChunksInParallel(downloadChunks);

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