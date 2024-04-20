import { DownloadBundle, LokaliseApi } from "@lokalise/node-api";
import { getAllHashes } from "./persistence.js";
import JsFileDownloader from "js-file-downloader";
import { Writer } from "fstream";
import fs, { rmSync } from "node:fs";
import { Parse } from "unzip";

export async function download(language_isos: string[], project_id: string, lokalise: LokaliseApi) {
  const hashObjs = getAllHashes();

  const downloadPromises: any[] = [];
  for (const hashObj of hashObjs) {
    const filename = `${hashObj.namespace}/${hashObj.jarVersion}.json`;

    const excludedLangs = hashObj.ignoredLocales;
    const languages = language_isos.filter(lang => !excludedLangs.includes(lang));

    downloadPromises.push({
      namespace: hashObj.namespace,
      version: hashObj.jarVersion,
      filePath: `./repo/${filename}`,
      downloadPromise: lokalise.files().download(project_id, {
        format: "json",
        filter_langs: languages,
        filter_filenames: [filename],
        export_empty_as: "skip",
        placeholder_format: "printf"
      })
    });
  }

  // Await promise.all for downloadPromises.[*].downloadPromise
  const results = await Promise.all(downloadPromises.map(async downloadPromise => {
    const download = await downloadPromise.downloadPromise;
    return {
      namespace: downloadPromise.namespace,
      version: downloadPromise.version,
      bundle_url: download.bundle_url,
      filePath: downloadPromise.filePath
    };
  }));


  for(const result of results) {
    if(result.bundle_url) {
      // Download bundle into temp folder and extract it into `./repo` folder, preserving the directory structure.
      await new JsFileDownloader({
        url: result.bundle_url,
        filename: `./temp/${result.namespace}-${result.version}.zip`,
        autoStart: true
      });

      // Extract zip into `./repo` folder.
      const readStream: any = fs.createReadStream(`./temp/${result.namespace}-${result.version}.zip`);
      const writeStream: any = Writer(`./repo/`);
      
      readStream
        .pipe(Parse())
        .pipe(writeStream)

      readStream.on("end", () => {
        console.log("File extracted.");
        // Delete zip file.
        rmSync(`./temp/${result.namespace}-${result.version}.zip`);
      });
    }
  }
}