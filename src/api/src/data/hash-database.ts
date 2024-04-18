let database: Loki;

export function setup(db: Loki) {
  database = db;

  db.addCollection("hashes", {
    unique: ["hash", "modVersion"]
  });
}

export function addHash(hash: string, modVersion: string): { loki: number, hash: string, modVersion: string } | null {
  const collection = database.getCollection("hashes");

  // If hash already exists, return null;
  if (collection.findOne({ hash }) !== null) {
    return null;
  }

  // If mod version already exists, append a number to the end, eg: +i1.json
  let i = 0;
  const originalModVersion = `${modVersion}`;
  while (collection.findOne({ modVersion }) !== null) {
    i++;
    modVersion = `${originalModVersion}+v${i}`;
  }


  const object = collection.insert({ hash, modVersion });

  return {
    loki: object.$loki,
    hash: object.hash,
    modVersion: object.modVersion
  };
}