import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";

import tar from "tar-stream";
import { afterEach, describe, expect, test } from "vitest";

const release = "0123456789abcdef0123456789abcdef01234567";
const script = resolve("scripts/verify-release-archive.mjs");
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

describe("release archive verification CLI", () => {
  test("rejects an archive whose recorded checksum does not match", async () => {
    const fixture = await createFixture([
      {
        name: "output/config.json",
        contents: '{"version":3}\n',
      },
    ]);
    await writeFile(
      fixture.checksumPath,
      `${"0".repeat(64)}  release.tgz\n`,
      "utf8"
    );

    const result = verify(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("checksum does not match");
  });

  test("rejects an oversized checksum record before parsing it", async () => {
    const fixture = await createFixture([
      {
        name: "output/config.json",
        contents: '{"version":3}\n',
      },
    ]);
    await writeFile(fixture.checksumPath, "0".repeat(1_024), "utf8");

    const result = verify(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("checksum file must be exactly 78 bytes");
  });

  test("extracts a checksummed static release with the expected identity", async () => {
    const fixture = await createFixture(staticReleaseEntries(release));

    const result = verify(fixture);

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    await expect(
      readFile(
        join(fixture.destinationPath, "output/static/index.html"),
        "utf8"
      )
    ).resolves.toContain("Delivery status");
  });

  test("rejects archive paths that escape the extraction destination", async () => {
    const fixture = await createFixture([
      { name: "output/", type: "directory" },
      {
        name: "../outside",
        contents: "must not be written",
      },
    ]);

    const result = verify(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("unsafe path");
    await expect(
      readFile(join(fixture.destinationPath, "..", "outside"), "utf8")
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("rejects executable deployment units", async () => {
    const fixture = await createFixture([
      ...staticReleaseEntries(release),
      {
        name: "output/functions/unsafe.func/.vc-config.json",
        contents: "{}",
      },
    ]);

    const result = verify(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("not static-only");
  });

  test("rejects release metadata for a different commit", async () => {
    const fixture = await createFixture(staticReleaseEntries("f".repeat(40)));

    const result = verify(fixture);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("identity does not match");
  });
});

function staticReleaseEntries(identity) {
  return [
    { name: "output/", type: "directory" },
    { name: "output/static/", type: "directory" },
    {
      name: "output/config.json",
      contents: '{"version":3}\n',
    },
    {
      name: "output/static/index.html",
      contents: "<!doctype html><title>Delivery status</title>",
    },
    {
      name: "output/static/release.json",
      contents: `${JSON.stringify({ release: identity })}\n`,
    },
  ];
}

async function createFixture(entries) {
  const directory = await mkdtemp(join(tmpdir(), "de-release-"));
  temporaryDirectories.push(directory);

  const archivePath = join(directory, "release.tgz");
  const checksumPath = join(directory, "release.tgz.sha256");
  const destinationPath = join(directory, "extracted");
  const pack = tar.pack();
  const archivePromise = collect(pack);

  for (const entry of entries) {
    await addEntry(pack, entry);
  }

  pack.finalize();
  const archive = gzipSync(await archivePromise);
  const checksum = createHash("sha256").update(archive).digest("hex");
  await writeFile(archivePath, archive);
  await writeFile(checksumPath, `${checksum}  release.tgz\n`, "utf8");

  return { archivePath, checksumPath, destinationPath };
}

function addEntry(pack, { name, contents = "", type = "file" }) {
  return new Promise((resolveEntry, rejectEntry) => {
    pack.entry({ name, type }, contents, (error) => {
      if (error) {
        rejectEntry(error);
        return;
      }

      resolveEntry();
    });
  });
}

async function collect(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function verify({ archivePath, checksumPath, destinationPath }) {
  return spawnSync(
    process.execPath,
    [script, archivePath, checksumPath, release, destinationPath],
    { encoding: "utf8" }
  );
}
