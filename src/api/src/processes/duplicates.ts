import { Key, LokaliseApi } from "@lokalise/node-api";
import _ from "lodash";

let IS_LOCKED = false;

function findDuplicateObjects(array: Key[][]) {
  // Function to find duplicates within a chunk
  function findDuplicatesInChunk(chunk: Key[]) {
    const grouped = _.groupBy(chunk, obj => {
      const enTranslation = _.find(obj.translations, { language_iso: 'en' });

      if (enTranslation === undefined) {
        return `${obj.key_id}`
      }

      return `${obj.key_name}-${enTranslation.translation}`
    });
    const duplicates = _.filter(grouped, group => group.length > 1);
    return duplicates;
  }

  return _.flatMap(array, findDuplicatesInChunk);
}


export default async function manageDuplicates(lokalise: LokaliseApi, project_id: string) {
  if (IS_LOCKED) {
    return;
  }

  IS_LOCKED = true;

  // Get all keys.
  let keys: Key[] = [];
  let page = await lokalise.keys().list({
    project_id,
    limit: 5000,
    page: 1
  });
  keys.push(...page.items);

  while (page.hasNextPage()) {
    const nextPage = page.nextPage();
    page = await lokalise.keys().list({
      project_id,
      limit: 5000,
      page: nextPage
    });
  }

  const chunkedKeys: Key[][] = _.chunk(keys, 1000);

  // Remove keys array from memory to free up memory.
  keys = null;

  const duplicates: Key[][] = findDuplicateObjects(chunkedKeys);

  let keysToDelete: number[] = [];
  for (const duplicateGroup of duplicates) {
    // created_at_timestamp unix - Keep the oldest key, delete the rest.
    const oldest = _.minBy(duplicateGroup, 'created_at_timestamp');

    let keysToRemove = _.filter(duplicateGroup, key => key.key_id !== oldest.key_id);

    keysToDelete.push(...keysToRemove.map(key => key.key_id));
  }

  if(keysToDelete.length > 0) {
    // Delete all duplicate keys.
    await lokalise.keys().bulk_delete(keysToDelete, { project_id });
  }

  IS_LOCKED = false;
  return;
}