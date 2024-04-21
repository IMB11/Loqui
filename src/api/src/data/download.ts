import { DownloadBundle, LokaliseApi } from "@lokalise/node-api";
import { getAllHashes } from "./persistence.js";
import fs, { existsSync, mkdir, mkdirSync, rmSync } from "node:fs";
import { Extract } from "unzipper";
import { resolve } from "node:path";
import logger from "../logger.js";
import { delay } from "lodash";
import { globSync } from "glob";
import _ from "lodash";

let downloadLock = false;

export async function download(language_isos: string[], project_id: string, lokalise: LokaliseApi) {
  if(downloadLock) return;
  downloadLock = true;

  logger.info("Downloading translations...");
  const hashObjs = getAllHashes();

  logger.debug(`Recieved ${hashObjs.length} hash objects.`);

  const downloadPromises: any[] = [];
  for (const hashObj of hashObjs) {
    const filename = `${hashObj.namespace}/${hashObj.jarVersion}.json`;

    logger.debug(`Checking for ${filename}...`);

    const excludedLangs = hashObj.ignoredLocales;
    const languages = language_isos.filter(lang => !excludedLangs.includes(lang));

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
    } catch (e) {
      logger.error(`${filename}: ${e.message}`);
      continue;
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

  for(const result of results) {
    if(result.bundle_url) {
      // Download bundle into temp folder and extract it into `./repo` folder, preserving the directory structure.
      const targetPath = `./temp/${result.namespace}-${result.version}.zip`;
      logger.debug(result.bundle_url);
      const data = await fetch(result.bundle_url).then(res => res.arrayBuffer());

      fs.writeFileSync(targetPath, Buffer.from(data));

      // Extract zip into `./repo` folder.
      const readStream = fs.createReadStream(`./temp/${result.namespace}-${result.version}.zip`).pipe(Extract({ path: `./repo`}));
    }
  }

  logger.info("Translations downloaded.");

  downloadLock = false;
}