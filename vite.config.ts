import { defineConfig, type Plugin } from "vite";

const release = process.env.VITE_RELEASE_SHA ?? "local";

const releaseMetadata = (): Plugin => ({
  name: "release-metadata",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "release.json",
      source: `${JSON.stringify({ release }, null, 2)}\n`,
    });
  },
});

export default defineConfig({
  plugins: [releaseMetadata()],
});
