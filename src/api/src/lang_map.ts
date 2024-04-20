import { LokaliseApi } from "@lokalise/node-api";
import _ from "lodash";

export const fallbackMap = {
  "es_ar": "es_es",
  "esan": "es_es",
  "en_au": "en_us",
  "de_at": "de_de",
  "bar": "de_de",
  "brb": "nl_nl",
  "en_gb": "en_us",
  "en_ca": "en_us",
  "fr_ca": "fr_fr",
  "es_cl": "es_es",
  "zh_hk": "zh_tw",
  "fra_de": "de_de",
  "es_ec": "es_es",
  "fur_it": "it_it",
  "ksh": "de_de",
  "lmo": "it_it",
  "nds_de": "de_de",
  "zlm_arab": "ar_sa",
  "es_mx": "es_es",
  "en_nz": "en_us",
  "ry_ua": "ru_ru",
  "szl": "pl_pl",
  "de_ch": "de_de",
  "sxu": "de_de",
  "es_uy": "es_es",
  "vec_it": "it_it",
  "es_ve": "es_es"
}

const reverseFallbacks: { [baseLocale: string]: string[] } = {};

_.forEach(fallbackMap, (value, key) => {
  if (!reverseFallbacks[value]) {
    reverseFallbacks[value] = [];
  }

  reverseFallbacks[value].push(key);
});

export {reverseFallbacks};

export function transformLocaleArray(locales: string[], supportedLanguages: string[], project_id: string): string[] {
  const filteredLanguages = new Set(_.filter(locales, locale => supportedLanguages.includes(safeParseLocale(locale))))

  return [...filteredLanguages];
}

export function safeParseLocale(locale: string) {
  return fallbackMap[locale] ?? locale;
}