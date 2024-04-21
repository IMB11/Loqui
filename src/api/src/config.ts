import { readFileSync } from "node:fs";


export const config = JSON.parse(readFileSync(".secrets.json", "utf-8"));
