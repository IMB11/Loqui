import { LokaliseApi } from "@lokalise/node-api";
import { getAllHashes } from "./persistence.js";
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { Extract } from "unzipper";
import logger from "../logger.js";
import _ from "lodash";
import { glob, globSync } from "glob";

let downloadLock = false;

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

  const downloadPromises: any[] = [];
  for (const hashObj of hashObjs) {
    const filename = `${hashObj.namespace}/${hashObj.jarVersion}.json`;

    logger.debug(`Checking for ${filename}...`);

    const excludedLangs = hashObj.ignoredLocales;
    const languages = language_isos.filter(lang => !excludedLangs.includes(lang));

    let tries = 3;
    while (true) {
      try {
        downloadPromises.push({
          namespace: hashObj.namespace,
          version: hashObj.jarVersion,
          filePath: `./repo/${filename}`,
          downloadPromise: await lokalise.files().download(project_id, {
            format: "json",
            filter_langs: languages,
            filter_filenames: [filename],
            export_empty_as: "skip",
            placeholder_format: "printf"
          })
        });
        break;
      } catch (e) {
        tries++;
        if (tries === 3) {
          logger.error("Failed to download translations. Skipping...");
          break;
        }

        logger.error("Failed to download translations. Retrying in 0.5 seconds... " + tries + "/3");
        await delay(0.5);
        continue;
      }
    }
  }

  logger.debug(`Recieved ${downloadPromises.length} download promises.`)

  // Await promise.all for downloadPromises.[*].downloadPromise
  const results = downloadPromises.map(downloadPromise => {
    logger.info(`Downloading ${downloadPromise.namespace}-${downloadPromise.version}.json...`)
    return {
      namespace: downloadPromise.namespace,
      version: downloadPromise.version,
      bundle_url: downloadPromise.downloadPromise.bundle_url,
      filePath: downloadPromise.filePath
    };
  });

  mkdirSync("./temp", { recursive: true });
  mkdirSync("./repo", { recursive: true });

  for (const result of results) {
    if (result.bundle_url) {
      // Download bundle into temp folder and extract it into `./repo` folder, preserving the directory structure.
      const targetPath = `./temp/${result.namespace}-${result.version}.zip`;
      logger.debug(result.bundle_url);
      const data = await fetch(result.bundle_url).then(res => res.arrayBuffer());

      writeFileSync(targetPath, Buffer.from(data));

      // Extract zip into `./repo` folder.
      const readStream = createReadStream(`./temp/${result.namespace}-${result.version}.zip`).pipe(Extract({ path: `./repo` }));
    }
  }

  // Validate all JSON files in the `./repo` folder - delete if invalid.
  const globResult = globSync(`./repo/**/**/*.json`);

  logger.info(`Validating ${globResult.length} JSON files...`)

  globResult.map(value => {
    const fileContents = readFileSync(value, "utf-8");
    try {
      JSON.parse(fileContents);
    } catch (e) {
      logger.error(`File ${value} is not valid JSON. Deleting.`);
      rmSync(value);
    }
    return;
  })

  logger.info("Translations downloaded.");



  downloadLock = false;
}