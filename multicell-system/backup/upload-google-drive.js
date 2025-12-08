// Upload para Google Drive do backup mais recente (.zip)
// Requer: npm i googleapis
// Defina variáveis: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN

import fs from "fs";
import path from "path";
import { google } from "googleapis";

const BACKUP_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname)
);
const YEAR_FOLDER = new Date().getFullYear().toString();

function getLatestZip(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".zip"))
    .map((f) => ({ name: f, time: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  return files[0]?.name ? path.join(dir, files[0].name) : null;
}

async function ensureFolder(drive, name, parent) {
  const q = [
    `name='${name.replace("'", "''")}'`,
    "mimeType='application/vnd.google-apps.folder'",
    parent ? `'${parent}' in parents` : "not 'trash' in parents",
  ].join(" and ");
  const res = await drive.files.list({ q, fields: "files(id,name)" });
  if (res.data.files?.length) return res.data.files[0].id;
  const created = await drive.files.create({
    resource: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parent ? [parent] : undefined,
    },
    fields: "id",
  });
  return created.data.id;
}

async function main() {
  const latest = getLatestZip(BACKUP_DIR);
  if (!latest) {
    console.error("Nenhum backup .zip encontrado");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const rootFolder = await ensureFolder(drive, "MulticellSystem", null);
  const yearFolder = await ensureFolder(drive, "Backups", rootFolder);
  const targetFolder = await ensureFolder(drive, YEAR_FOLDER, yearFolder);

  const fileMetadata = {
    name: path.basename(latest),
    parents: [targetFolder],
  };
  const media = {
    mimeType: "application/zip",
    body: fs.createReadStream(latest),
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id,webViewLink,webContentLink",
  });
  console.log("Upload concluído:", res.data);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
