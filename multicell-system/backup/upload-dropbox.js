// Upload do backup mais recente (.zip) para Dropbox
// Requer: npm i dropbox
// Defina: DROPBOX_ACCESS_TOKEN

import fs from "fs";
import path from "path";
import { Dropbox } from "dropbox";

const BACKUP_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname)
);

function latestZip() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".zip"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);
  return files[0]?.name ? path.join(BACKUP_DIR, files[0].name) : null;
}

async function main() {
  const file = latestZip();
  if (!file) {
    console.error("Nenhum backup .zip encontrado");
    process.exit(1);
  }

  const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch,
  });
  const content = fs.readFileSync(file);
  const dest = `/MulticellSystem/Backups/${path.basename(file)}`;

  const res = await dbx.filesUpload({
    path: dest,
    contents: content,
    mode: { ".tag": "overwrite" },
  });
  console.log("Upload concluído:", res);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
