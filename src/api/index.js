const express = require("express");
const YAML = require("yaml");
const bodyparser = require("body-parser");
const fs = require("fs");
const simplegit = require("simple-git").default;
const config = require("./.secrets.json");
const { getFile } = require("./util");

(async () => {
  // Load repository into ./repo if it doesnt exist.
  if (!fs.existsSync("./repo")) {
    await simplegit().clone(
      "https://github.com/" + config.github_repo + ".git",
      "./repo"
    );
  }

  const git = simplegit("./repo");
  const app = express();

  app.use(bodyparser.json());

  await git.pull();

  app.get("/:namespace/:version", async (req, res) => {
    const namespace = req.params.namespace;
    const version = req.params.version;

    const path = `./repo/${namespace}/${version}.json`;

    const contents = getFile(namespace, version);

    if (contents === null) {
      res.status(404).send({ error: "File not found." });
    } else {
      res.contentType("application/json");
      res.status(200).send(contents);
    }
  });

  app.post("/bulk-get", async (req, res) => {
    const body = req.body;

    if (!Array.isArray(body)) {
      res.status(400).send({
        error: "Invalid request - expected array of namespace objects.",
      });
      return;
    }

    const results = [];
    for (const namespaceObject of body) {
      const namespace = namespaceObject.namespace;
      const version = namespaceObject.version;

      const path = `./repo/${namespace}/${version}/`;

      if (!fs.existsSync(path)) continue;

      const files = fs.readdirSync(path);
      const contents = {};
      for (const file of files) {
        // Load the translation file for each language.
        const content = fs.readFileSync(`${path}/${file}`, "utf-8");
        const language = file.split(".")[0];
        contents[language] = content;
      }

      if (contents != null) {
        results.push({ namespace, version, contents });
      }
    }

    res.contentType("application/json");
    res.status(200).send(results);
  });

  const submissionQueue = [];

  let isProcessing = false;
  setInterval(async () => {
    // Process the next submission in the queue.
    const submission = submissionQueue.shift();

    if (submission && !isProcessing) {
      isProcessing = true;

      // If the namespace already exists, check if the version exists too.
      // If it does, ignore it.
      for (const namespaceObject of submission) {
        const namespace = namespaceObject.namespace;
        const version = namespaceObject.version;

        const dir = `./repo/${namespace}`;
        const path = `./repo/${namespace}/${version}.json`;

        if (fs.existsSync(path)) {
          continue;
        }

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);

          // Namespace doesn't exist, so we need to create a new directory with namespace-config.json which maps versions and the required languages for each version.
          const config = {};
          config[version] = namespaceObject.excludedLanguages;
        } else {
          // Namespace exists, load config and edit it if needed.
          const configPath = `./repo/${namespace}/${namespace}-config.json`;
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

          if (!config[version]) {
            config[version] = namespaceObject.excludedLanguages;
          }
        }

        // Write contents to path.
        fs.writeFileSync(path, namespaceObject.contents);
      }

      await git.add("*");

      // Regenerate the crowdin config file.

      // Files should be an array of objects with the following structure:
      // - source: /<namespace>/<version>.json
      // - translation: /<namespace>/<version>/%locale_with_underscore%.json
      // - excluded_target_languages: languages specified in namespace config file's version array thingy from above.
      const config = {
        files: [],
      };

      // Get all namespace folders - exclude crowdin.yml and README.md
      const namespaces = fs.readdirSync("./repo").filter((f) => {
        return f !== "crowdin.yml" && f !== "README.md";
      });

      for (const namespace of namespaces) {
        const versions = fs.readdirSync(`./repo/${namespace}`).filter((f) => {
          return f !== "namespace-config.json";
        });

        // For each version, get the languages from the config file.
        for (const version of versions) {
          const languages = JSON.parse(
            fs.readFileSync(
              `./repo/${namespace}/${namespace}-config.json`,
              "utf-8"
            )
          )[version];

          const serializedLanguages = [];

          // For each language code, make it xx-XX if it's not already.
          for (const language of languages) {
            if (language.includes("-")) {
              serializedLanguages.push(language);
            } else {
              const parts = language.split("_");
              serializedLanguages.push(parts.join("-"));
            }
          }

          // Add to config.
          config.files.push({
            source: `/${namespace}/${version}.json`,
            translation: `/${namespace}/${version}/%locale_with_underscore%.json`,
            excluded_target_languages: serializedLanguages,
          });
        }
      }

      // Write the config to crowdin.yml
      const yml = YAML.stringify(config);
      if (fs.existsSync("./repo/crowdin.yml")) fs.rmSync("./repo/crowdin.yml");
      fs.writeFileSync("./repo/crowdin.yml", yml);

      // await git.push("origin", "main");

      isProcessing = false;
    }
  }, 1000);

  app.post("/submit", async (req, res) => {
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
        });
        return;
      }
    }

    // Submit to submissionQueue;
    submissionQueue.push(body);
    return res.status(200).send({ success: true });
  });

  app.listen(9182, () => {
    console.log("Server is running on port 9182");
  });
})();
