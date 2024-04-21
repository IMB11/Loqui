import * as express from "express";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
const { json } = bodyParser;

import { LokaliseApi } from "@lokalise/node-api";
import { submitTranslationRequest } from "./requests/submission.js";
import logger from "./logger.js";
import { db } from "./data/persistence.js";
import { config } from "./config.js";
import { download } from "./data/download.js";
import { retrieveTranslations } from "./requests/retrieval.js";
import { copyFileSync, readdirSync, rmSync, statSync, unlinkSync } from "node:fs";

const project_id = config.lokalise_project_id;
const lokalise = new LokaliseApi({
  apiKey: config.lokalise_api_key,
  enableCompression: true
});

db.authenticate();

logger.info("Starting server...");

try {
  (async () => {
    const app = express.default();

    const language_isos = (await lokalise.languages().list({ project_id, limit: 500 })).items.map(lang => lang.lang_iso);
    download(language_isos, project_id, lokalise);
  
    // const keys = await lokalise.keys().list({ project_id, limit: 5000 });
    // await lokalise.keys().bulk_delete(keys.items.map(key => key.key_id), { project_id })
  
    app.use(express.static("public"));
    app.use(json({ limit: '5mb' }));
  
    //#region Deprecated Functions
    app.post("/bulk-get", rateLimit({
      windowMs: 30 * 60 * 1000, // 30 mins per window.
      max: 15, // max 15 requests per window.
      standardHeaders: true,
    }), async (req, res) => {
      // Mark deprecated.
      return res.status(410).send({
        message: "This endpoint has been deprecated. Please update your Loqui mod to access new translations.",
        error: "deprecated",
      });
    });
  
    app.post("/submit", async (req, res) => {
      // Mark deprecated.
      return res.status(410).send({
        message: "This endpoint has been deprecated. Please update your Loqui mod to access new translations.",
        error: "deprecated",
      });
    });
  
    app.get("/health", rateLimit({
      windowMs: 1 * 60 * 1000, // 1 mins per window.
      max: 3, // max 3 requests per window.
      standardHeaders: true,
    }), (req, res) => {
      // Mark deprecated.
      return res.status(410).send({
        message: "This endpoint has been deprecated. Please update your Loqui mod to access new translations.",
        error: "deprecated",
      });
    });
    //#endregion
  
    app.post("/api/v2/submit", rateLimit({
      windowMs: 30 * 60 * 1000,
      max: 15,
      standardHeaders: true,
    }), (req, res) => {
      submitTranslationRequest(lokalise, project_id, req, res);
    });
  
    app.post("/api/v2/retrieve", rateLimit({
      windowMs: 30 * 60 * 1000,
      max: 15,
      standardHeaders: true,
    }), (req, res) => {
      retrieveTranslations(req, res);
    })
  
    app.get("/", (req, res) => {
      res.sendFile("index.html", { root: "./public" })
    })
  
    app.set('trust proxy', 1)
  
    app.listen(config.port_number, () => {
      logger.info("Server is running on port " + config.port_number);
    });
    
    // Every hour.
    setInterval(() => {
      download(language_isos, project_id, lokalise);
    }, 1000 * 60 * 60)

    // Backup .data/db.sqlite every 4 hours.
    setInterval(() => {
      copyFileSync("./data/db.sqlite", `./data/backups/db-${Date.now()}.sqlite`);

      // Delete any backups older than 4 days.
      const now = Date.now();
      const weekAgo = now - (1000 * 60 * 60 * 24 * 4);
      const files = readdirSync("./data/backups");
      for (const file of files) {
        const stats = statSync(`./data/backups/${file}`);
        if (stats.mtimeMs < weekAgo) {
          rmSync(`./data/backups/${file}`);
        }
      }
    }, 1000 * 60 * 60 * 4)
  })()
} catch (e) {
  logger.error(e);
  process.exit(1);
};