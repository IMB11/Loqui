import * as express from "express";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
const { json } = bodyParser;

import { LokaliseApi } from "@lokalise/node-api";
import { submitTranslationRequest } from "./requests/submission.js";
import logger from "./logger.js";
import { bumpContribution, db, getLeaderboard } from "./data/persistence.js";
import { config } from "./config.js";
import { download } from "./data/download.js";
import { retrieveTranslations } from "./requests/retrieval.js";
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync } from "node:fs";
import manageDuplicates from "./processes/duplicates.js";
import type { WebhookProjectTranslationUpdated } from "@lokalise/node-api";
import { createHash } from "node:crypto";

const project_id = config.lokalise_project_id;
const lokalise = new LokaliseApi({
  apiKey: config.lokalise_api_key,
  enableCompression: true
});

db.authenticate();

logger.info("Starting server...");

function backup() {
  mkdirSync("./.data/backups", { recursive: true });
  copyFileSync("./.data/db.sqlite", `./.data/backups/db-${Date.now()}.sqlite`);

  // Delete any backups older than 4 days.
  const now = Date.now();
  const weekAgo = now - (1000 * 60 * 60 * 24 * 4);
  const files = readdirSync("./.data/backups");
  for (const file of files) {
    const stats = statSync(`./.data/backups/${file}`);
    if (stats.mtimeMs < weekAgo) {
      rmSync(`./.data/backups/${file}`);
    }
  }
}

try {
  (async () => {
    backup();
    const app = express.default();

    const language_isos = (await lokalise.languages().list({ project_id, limit: 500 })).items.map(lang => lang.lang_iso);

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

    app.post("/api/v2/webhook", async (req, res) => {
      if(req.headers["X-Secret"] !== config.webhook_password) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      
      const body = req.body;

      if(req.body.event === "project.translation.updated") {
        const data = body as WebhookProjectTranslationUpdated;
        bumpContribution(data.user.email);
      }

      res.status(200).send({ message: "OK" });
    });

    let contributorFetchDate = Date.now();
    let contributors = await lokalise.contributors().list({ project_id, limit: 500 });
    app.get("/api/v2/leaderboard", async (req, res) => {
      const leaderboardEntries = getLeaderboard();

      // If fetch date is older than 2 hours, fetch new contributors.
      if(Date.now() - contributorFetchDate > 1000 * 60 * 60 * 2) {
        contributors = await lokalise.contributors().list({ project_id, limit: 500 });
        contributorFetchDate = Date.now();
      }

      const leaderboard = leaderboardEntries.map(entry => {
        const contributor = contributors.items.find(contributor => contributor.email === entry.email);
        if(!contributor) return null;
        return {
          name: contributor.fullname,
          avatar: `https://gravatar.com/avatar/${createHash("sha256").update(contributor.email.trim().toLowerCase()).digest("hex")}`,
          contributions: entry.contributions
        }
      }).filter(entry => entry !== null) as { name: string, avatar: string, contributions: number }[];

      return res.send(leaderboard);
    });

    app.set('trust proxy', 1)

    app.listen(config.port_number, () => {
      logger.info("Server is running on port " + config.port_number);
    });

    // Every 24 hours.
    setInterval(() => {
      logger.info("Downloading translations...");
      download(language_isos, project_id, lokalise);
    }, 1000 * 60 * 60 * 24)

    // Backup .data/db.sqlite every 4 hours.
    setInterval(() => {
      logger.info("Backing up database...");
      backup();
    }, 1000 * 60 * 60 * 4)
  })()
} catch (e) {
  logger.error(e);
  process.exit(1);
};