import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, posix, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { gunzipSync } from "node:zlib";

import tar from "tar-stream";

const maximumArchiveBytes = 10 * 1024 * 1024;
const maximumExtractedBytes = 50 * 1024 * 1024;
const maximumEntries = 1_000;
const cliArguments = process.argv.slice(2);

if (cliArguments[0] === "--") {
  cliArguments.shift();
}

const [archivePath, checksumPath, expectedRelease, destinationPath] =
  cliArguments;

if (!archivePath || !checksumPath || !expectedRelease || !destinationPath) {
  throw new Error(
    "Usage: verify-release-archive <archive> <checksum> <expected-release> <destination>"
  );
}

if (!/^[0-9a-f]{40}$/.test(expectedRelease)) {
  throw new Error("Expected release must be a full lowercase Git SHA");
}

const archiveStats = await stat(archivePath);

if (!archiveStats.isFile() || archiveStats.size > maximumArchiveBytes) {
  throw new Error(
    "Release archive is not a regular file within the size limit"
  );
}

const archive = await readFile(archivePath);
const checksumRecord = await readFile(checksumPath, "utf8");
const checksumMatch = /^([0-9a-f]{64}) {2}release\.tgz\n$/.exec(checksumRecord);

if (!checksumMatch) {
  throw new Error("Release checksum record has an unexpected format");
}

const actualChecksum = createHash("sha256").update(archive).digest("hex");

if (actualChecksum !== checksumMatch[1]) {
  throw new Error("Release archive checksum does not match its record");
}

const entries = await readArchive(archive);
validateBuildOutput(entries, expectedRelease);
await extract(entries, destinationPath);

async function readArchive(compressedArchive) {
  const expandedArchive = gunzipSync(compressedArchive, {
    maxOutputLength: maximumExtractedBytes,
  });
  const parser = tar.extract();
  const parsedEntries = new Map();
  let extractedBytes = 0;

  Readable.from(expandedArchive).pipe(parser);

  for await (const entry of parser) {
    const { header } = entry;
    const name = validateEntryName(header.name, header.type);

    if (parsedEntries.has(name)) {
      throw new Error(`Release archive contains duplicate entry: ${name}`);
    }

    if (parsedEntries.size >= maximumEntries) {
      throw new Error("Release archive contains too many entries");
    }

    if (header.type === "directory") {
      for await (const chunk of entry) {
        if (chunk.length > 0) {
          throw new Error("Release archive directory contains file data");
        }
      }

      parsedEntries.set(name, { contents: undefined, type: "directory" });
      continue;
    }

    if (header.type !== "file") {
      throw new Error(`Release archive entry has unsafe type: ${header.type}`);
    }

    const chunks = [];
    let entryBytes = 0;

    for await (const chunk of entry) {
      entryBytes += chunk.length;
      extractedBytes += chunk.length;

      if (
        entryBytes > maximumArchiveBytes ||
        extractedBytes > maximumExtractedBytes
      ) {
        throw new Error("Release archive expands beyond the size limit");
      }

      chunks.push(chunk);
    }

    parsedEntries.set(name, {
      contents: Buffer.concat(chunks),
      type: "file",
    });
  }

  return parsedEntries;
}

function validateEntryName(rawName, type) {
  if (!rawName || rawName.includes("\\") || rawName.includes("\0")) {
    throw new Error("Release archive contains an unsafe path");
  }

  const name = rawName.endsWith("/") ? rawName.slice(0, -1) : rawName;
  const parts = name.split("/");

  if (
    posix.isAbsolute(name) ||
    posix.normalize(name) !== name ||
    parts.some((part) => !part || part === "." || part === "..") ||
    parts[0] !== "output"
  ) {
    throw new Error(`Release archive contains an unsafe path: ${rawName}`);
  }

  if (parts.length === 1 && type !== "directory") {
    throw new Error("Release archive output root must be a directory");
  }

  if (parts.length > 1 && parts[1] !== "config.json" && parts[1] !== "static") {
    throw new Error(`Release archive is not static-only: ${rawName}`);
  }

  if (parts[1] === "config.json" && parts.length !== 2) {
    throw new Error(
      `Release archive contains an invalid config path: ${rawName}`
    );
  }

  return name;
}

function validateBuildOutput(parsedEntries, release) {
  const config = readJsonEntry(parsedEntries, "output/config.json");

  if (
    Object.keys(config).length !== 1 ||
    config.version !== 3 ||
    !parsedEntries.has("output/static/index.html")
  ) {
    throw new Error("Release archive is not a Vercel static Build Output v3");
  }

  const releaseMetadata = readJsonEntry(
    parsedEntries,
    "output/static/release.json"
  );

  if (
    Object.keys(releaseMetadata).length !== 1 ||
    releaseMetadata.release !== release
  ) {
    throw new Error("Release archive identity does not match the expected SHA");
  }
}

function readJsonEntry(parsedEntries, name) {
  const entry = parsedEntries.get(name);

  if (!entry?.contents) {
    throw new Error(`Release archive is missing ${name}`);
  }

  try {
    return JSON.parse(entry.contents.toString("utf8"));
  } catch {
    throw new Error(`Release archive contains invalid JSON at ${name}`);
  }
}

async function extract(parsedEntries, rawDestination) {
  const destination = resolve(rawDestination);
  await mkdir(destination);

  for (const [name, entry] of parsedEntries) {
    if (entry.type !== "file") {
      continue;
    }

    const target = resolve(destination, name);

    if (!target.startsWith(`${destination}${sep}`)) {
      throw new Error(`Release archive path escapes its destination: ${name}`);
    }

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, entry.contents, { flag: "wx", mode: 0o644 });
  }
}
