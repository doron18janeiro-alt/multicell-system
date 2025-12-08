// Upload do backup mais recente (.zip) para S3 compatível
// Requer: npm i @aws-sdk/client-s3
// Defina: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET, S3_PREFIX (opcional)

import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

  const client = new S3Client({ region: process.env.AWS_REGION });
  const Key = `${
    process.env.S3_PREFIX || "MulticellSystem/Backups/"
  }${path.basename(file)}`;
  const Body = fs.createReadStream(file);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key,
    Body,
    ContentType: "application/zip",
  });

  const res = await client.send(command);
  console.log("Upload concluído:", { key: Key, etag: res.ETag });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
