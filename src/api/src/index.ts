import * as express from "express";
import * as crowdin from "./crowdin";
import rateLimit from "express-rate-limit";
import { json } from "body-parser";
import { simpleGit } from "simple-git";
import { existsSync, readFileSync } from "fs";
import blacklist from "./blacklist";

const config = JSON.parse(readFileSync(".secrets.json", "utf-8"));
const user = "LqBot";
const repo = "github.com/mineblock11/loqui-translations";
const remoteURL = `https://${user}:${config.github_token}@${repo}`;

interface DownloadResponse {
  namespace: string;
  version: string;
  contents: { [locale: string]: string };
}

interface UploadRequest {
  namespace: string;
  version: string;
  contents: string;
  excludedLanguages: string[];
}

(async () => {
  // Load repository into ./repo if it doesnt exist.
  if (!existsSync("./repo")) {
    await simpleGit().clone(
      remoteURL,
      "./repo"
    );
  }

  if (!existsSync("./repo_readonly")) {
    await simpleGit().clone(
      remoteURL,
      "./repo_readonly",
      [ "--branch", "output"]
    );
  }

  const git = simpleGit("./repo");
  const readonlyGit = simpleGit("./repo_readonly");
  const app = express.default();

  await git.pull("origin", "main");
  await readonlyGit.pull("origin", "output");

  await crowdin.removeBlacklistedNamespaces();
  // await crowdin.migrate();

  app.use(json({limit: '5mb'}));

  app.post("/bulk-get", rateLimit({
    windowMs: 30 * 60 * 1000, // 30 mins per window.
    max: 15, // max 15 requests per window.
    standardHeaders: true,
  }), async (req, res) => {
    const body = req.body;
    const startTime = Date.now();

    // Expect an array of:
    // { namespace: string, version: string, requiredLanguages: string[] }

    if (!Array.isArray(body)) {
      console.log("Processed bulk-get in " + (Date.now() - startTime) + "ms. [invalid]");
      res.status(400).send({
        error:
          "Invalid request - expected array of valid namespace request objects.",
      });
      return;
    }

    for (const namespaceObject of body) {
      if (
        !namespaceObject.namespace ||
        !namespaceObject.version ||
        !namespaceObject.requiredLanguages
      ) {
        console.log("Processed bulk-get in " + (Date.now() - startTime) + "ms. [invalid]");
        res.status(400).send({
          error:
            "Invalid request - expected array of valid namespace request objects.",
          stacktrace: namespaceObject
        });
      }
    }

    await readonlyGit.pull("origin", "output");

    // Return an array of:
    const responses: DownloadResponse[] = [];
    const crowdinConfig = crowdin.loadConfig();
    const hashmap = crowdin.loadHashmap();

    for (const namespaceObject of body) {

      const namespaceHashes = hashmap[namespaceObject.namespace];

      if (!namespaceHashes) {
        continue;
      }

      const versionHash = namespaceHashes[namespaceObject.version];

      if (!versionHash) {
        continue;
      }

      const response: DownloadResponse = {
        namespace: namespaceObject.namespace,
        version: namespaceObject.version,
        contents: {}
      };


      for (const lang of namespaceObject.requiredLanguages) {
        const data = crowdin.tryGetEntry(crowdinConfig, namespaceObject.namespace, versionHash, namespaceObject.version, lang);

        if (data) {
          response.contents[lang] = data;
        }
      };

      responses.push(response);
    }

    console.log(`Processed bulk-get in ${Date.now() - startTime}ms.`);
    return res.status(200).send(responses);
  });

  const submissionQueue: UploadRequest[][] = [];
  let isProcessing = false;
  setInterval(async () => {

    // time how long it takes to perform this operation.
    const start = Date.now();

    // Process the next submission in the queue.
    const submission = submissionQueue.shift();
    const hashmap = crowdin.loadHashmap();

    if (submission && !isProcessing) {
      isProcessing = true;

      await git.pull("origin", "main");
      const crowdinConfig = crowdin.loadConfig();

      for (const namespaceObject of submission) {
        if (blacklist.includes(namespaceObject.namespace)) {
          continue;
        }

        let namespaceHash = hashmap[namespaceObject.namespace];

        if (!namespaceHash) {
          hashmap[namespaceObject.namespace] = {};
          namespaceHash = hashmap[namespaceObject.namespace];
        }

        let versionHash = namespaceHash[namespaceObject.version];

        if (versionHash) {
          continue;
        } else {
          // Generate hash
          namespaceHash[namespaceObject.version] = crowdin.generateHash(namespaceObject.contents);
          versionHash = namespaceHash[namespaceObject.version];
          hashmap[namespaceObject.namespace] = namespaceHash;
          crowdin.saveHashmap(hashmap);
        }

        crowdin.addEntry(crowdinConfig, namespaceObject.namespace, versionHash, namespaceObject.contents, namespaceObject.excludedLanguages);
      }

      crowdin.optimizeConfig(crowdinConfig);

      await git.add("*");

      await git.commit("New Submission(s) from API [auto]");

      await git.push("origin", "main");

      isProcessing = false;

      console.log(`Processed submission in ${Date.now() - start}ms.`);
    }

  }, 1000);

  app.post("/submit", rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins per window.
    max: 5, // max 5 requests per window.
    standardHeaders: true,
  }), async (req, res) => {
    const body = req.body;

    // Expect an array of:
    // { namespace: string, version: string, contents: string, excludedLanguages: string[] }
    if (!Array.isArray(body)) {
      res.status(400).send({
        error:
          "Invalid request - expected array of valid namespace submission objects.",
      });
      return;
    }

    for (const namespaceObject of body) {
      if (
        !namespaceObject.namespace ||
        !namespaceObject.version ||
        !namespaceObject.contents ||
        !namespaceObject.excludedLanguages
      ) {
        res.status(400).send({
          error:
            "Invalid request - expected array of valid namespace submission objects.",
          stacktrace: namespaceObject,
        });
        return;
      }
    }

    // Submit to submissionQueue;
    submissionQueue.push(body);
    return res.status(200).send({ success: true });
  });

  app.get("/", (req, res) => {
    // Redirect to loqui.imb11.dev
    res.redirect("https://loqui.imb11.dev");
  });

  app.get("/health", rateLimit({
    windowMs: 1 * 60 * 1000, // 1 mins per window.
    max: 3, // max 3 requests per window.
    standardHeaders: true,
  }), (req, res) => {

    const crowdinConfig = crowdin.loadConfig();

    res.status(200).send({ status: "ok", groups: crowdinConfig.files.length });
  });

  app.set('trust proxy', 1)
  app.get('/ip', (request, response) => response.send(request.ip + " - THIS IS FOR TESTING THE CLOUDFLARE TUNNEL, DO NOT USE THIS IN PRODUCTION."))

  app.listen(config.port_number, () => {
    console.log("Server is running on port " + config.port_number);
  });
})();