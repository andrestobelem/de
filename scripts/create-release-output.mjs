import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const buildDirectory = resolve("dist");
const outputDirectory = resolve(".vercel/output");
const staticDirectory = resolve(outputDirectory, "static");

await access(buildDirectory);
await rm(outputDirectory, { force: true, recursive: true });
await mkdir(staticDirectory, { recursive: true });
await cp(buildDirectory, staticDirectory, { recursive: true });
await writeFile(
  resolve(outputDirectory, "config.json"),
  `${JSON.stringify({ version: 3 }, null, 2)}\n`
);
