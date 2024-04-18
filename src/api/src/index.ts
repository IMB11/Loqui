import * as express from "express";
import loki from "lokijs";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
const { json } = bodyParser;

import { readFileSync } from "node:fs";
import { LokaliseApi } from "@lokalise/node-api";
import { submitTranslationRequest } from "./requests/submission.js";
import * as hashDB from "./data/hash-database.js";

const db = new loki("loqui.db", {
  persistenceMethod: "fs",
  autoload: true,
	autosave: true, 
	autosaveInterval: 4000
});
const config = JSON.parse(readFileSync(".secrets.json", "utf-8"));
const project_id = config.lokalise_project_id;
const lokalise = new LokaliseApi({
  apiKey: config.lokalise_api_key
});

hashDB.setup(db);

console.log("Starting server...");

(async () => {
  const project = await lokalise.projects().get(project_id);

  const app = express.default();

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

  app.get("/", (req, res) => {
    // Redirect to loqui.imb11.dev
    res.redirect("https://loqui.imb11.dev");
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

  app.post("/v2/submit", (req, res) => {
    submitTranslationRequest(lokalise, project_id, req, res);
  });

  app.set('trust proxy', 1)

  app.listen(config.port_number, () => {
    console.log("Server is running on port " + config.port_number);
  });
})();