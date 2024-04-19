import * as express from "express";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
const { json } = bodyParser;

import { LokaliseApi } from "@lokalise/node-api";
import { submitTranslationRequest } from "./requests/submission.js";
import logger from "./logger.js";
import { db } from "./data/persistence.js";
import { config } from "./config.js";

const project_id = config.lokalise_project_id;
const lokalise = new LokaliseApi({
  apiKey: config.lokalise_api_key,
  enableCompression: true
});

db.authenticate();

logger.info("Starting server...");

(async () => {
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
    logger.info("Server is running on port " + config.port_number);
  });
})();