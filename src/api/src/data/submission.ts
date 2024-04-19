import { createHash } from "crypto";
import logger from "../logger.js";
import { config } from "../config.js";

export default interface Submission {
  namespace: string;
  jarVersion: string;
  // sha512 hash of the mod's jar file.
  jarHash: string;
  providedLocales: string[];
  baseLocaleData: string;
}

export function getBaseLocaleHash(submission: Submission) {
  // sha512 hash of baseLocaleData
  return createHash("sha512").update(submission.baseLocaleData).digest("hex");
}

export async function getModrinthFile(submission: Submission): Promise<any> {
  // https://api.modrinth.com/v2/version_file/{hash}
  const hash = submission.jarHash;
  const url = `https://api.modrinth.com/v2/version_file/${hash}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `${config.modrinth_api_key}`
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers
    });

    if(!response.ok) {
      throw new Error(`Failed to fetch Modrinth file: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    logger.error(error);
    return null;
  }
}