const express = require("express");
const YAML = require("js-yaml");
const bodyparser = require("body-parser");
const fs = require("fs");
const simplegit = require("simple-git").default;
const config = require("./.secrets.json");
const { getFile, mcCodeToCrowdin } = require("./util");

(async () => {
  // Load repository into ./repo if it doesnt exist.
  if (!fs.existsSync("./repo")) {
    await simplegit().clone(
      "https://github.com/" + config.github_repo + ".git",
      "./repo"
    );
  }

  if (!fs.existsSync("./repo_readonly")) {
    await simplegit().clone(
      "https://github.com/" + config.github_repo + ".git",
      "./repo_readonly",
      [ "--branch", "output"]
    );
  }

  const git = simplegit("./repo");
  const readonlyGit = simplegit("./repo_readonly");
  const app = express();

  app.use(bodyparser.json({limit: '5mb'}));

  await git.pull();
  await readonlyGit.pull();

  app.post("/bulk-get", async (req, res) => {
    const body = req.body;

    // Expect an array of:
    // { namespace: string, version: string, requiredLanguages: string[] }

    if (!Array.isArray(body)) {
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
        res.status(400).send({
          error:
            "Invalid request - expected array of valid namespace request objects.",
          stacktrace: namespaceObject
        });
      }
    }

    await readonlyGit.pull();

    // Return an array of:
    // { namespace: string, version: string, contents: { [locale: string]: string (lang file) } }
    const response = [];

    for (const namespaceObject of body) {
      const namespace = namespaceObject.namespace;
      const version = namespaceObject.version;
      const requiredLanguages = namespaceObject.requiredLanguages;

      const path = `./repo_readonly/${namespace}/${version}/`;

      if (!fs.existsSync(path)) {
        response.push({
          namespace,
          version,
          contents: {},
        });
        continue;
      }

      const langFiles = {};

      for (const language of requiredLanguages) {
        const crowdinLanguage = mcCodeToCrowdin[language];
        console.log(language);

        // If its not a valid language code, ignore it.
        if (!crowdinLanguage) {
          continue;
        }

        const langPath = `./repo_readonly/${namespace}/${version}/${crowdinLanguage}.json`;

        console.log(langPath);

        // If the translations haven't been generated yet, ignore it.
        if(!fs.existsSync(langPath)) {
          continue;
        }

        console.log(langPath)

        langFiles[language] = fs.readFileSync(langPath, "utf-8");
      }

      response.push({
        namespace,
        version,
        contents: langFiles,
      });
    }

    return res.status(200).send(response);
  });

  const submissionQueue = [];

  let isProcessing = false;
  setInterval(async () => {

    // time how long it takes to perform this operation.
    const start = Date.now();

    // Process the next submission in the queue.
    const submission = submissionQueue.shift();

    if (submission && !isProcessing) {
      isProcessing = true;

      await git.pull();

      // If the namespace already exists, check if the version exists too.
      // If it does, ignore it.
      for (const namespaceObject of submission) {
        const namespace = namespaceObject.namespace;
        const version = namespaceObject.version;

        const dir = `./repo/${namespace}`;
        const path = `./repo/${namespace}/${version}.json`;
        const configPath = `./repo/${namespace}/namespace-config.json`;

        if (fs.existsSync(path)) {
          continue;
        }

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);

          // Namespace doesn't exist, so we need to create a new directory with namespace-config.json which maps versions and the required languages for each version.
          const config = {};
          config[version] = namespaceObject.excludedLanguages;

          fs.writeFileSync(configPath, JSON.stringify(config), "utf-8");
        } else {
          // Namespace exists, load config and edit it if needed.
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
      // - translation: /<namespace>/<version>/%locale%.json
      // - excluded_target_languages: languages specified in namespace config file's version array thingy from above.
      let config = {
        files: []
      };

      if(fs.existsSync("./repo/crowdin.yml")) {
        config = YAML.load(fs.readFileSync("./repo/crowdin.yml", "utf-8"));
      }

      // Get all namespace folders - exclude crowdin.yml and README.md
      const namespaces = fs.readdirSync("./repo").filter((f) => {
        return f !== "crowdin.yml" && f !== "README.md" && f !== ".git";
      });

      for (const namespace of namespaces) {
        const versions = fs.readdirSync(`./repo/${namespace}`).filter((f) => {
          return f !== "namespace-config.json";
        });

        // For each version, get the languages from the config file.
        for (const versionFile of versions) {
          const version = versionFile.replace(".json", "")
          const versionDefinitions = JSON.parse(
            fs.readFileSync(
              `./repo/${namespace}/namespace-config.json`,
              "utf-8"
            )
          );
          
          // Check if source already exists in config.
          const existingEntry = config.files.find((f) => {
            return f.source === `/${namespace}/${version}.json`;
          });

          if (existingEntry) {
            continue;
          }

  
          const languages = versionDefinitions[version];

          const serializedLanguages = [];
          // For each language code, make it xx-XX if it's not already.
          for (const language of languages) {
            const serialized = mcCodeToCrowdin[language];
            if (serialized) {
              serializedLanguages.push(serialized);
            }

            // Ignore invalid language codes.
          }

          // Add to config.
          const temporaryConfigEntry = {
            source: `/${namespace}/${version}.json`,
            translation: `/${namespace}/${version}/%locale%.json`,
            excluded_target_languages: serializedLanguages,
          };

          if(temporaryConfigEntry.excluded_target_languages.length == 0) {
            delete temporaryConfigEntry.excluded_target_languages;
          }
          config.files.push(temporaryConfigEntry);
        }
      }

      // Write the config to crowdin.yml
      const yml = YAML.dump(config);
      if (fs.existsSync("./repo/crowdin.yml")) fs.rmSync("./repo/crowdin.yml");
      fs.writeFileSync("./repo/crowdin.yml", yml);

      await git.add("*");

      await git.push("origin", "main");

      isProcessing = false;

      console.log(`Processed submission in ${Date.now() - start}ms.`);
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
          stacktrace: namespaceObject,
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
