import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

test("Vercel serves the showcase as a static single-page app", () => {
  assert.equal(config.framework, null);
  assert.equal(config.outputDirectory, "artifacts/scene-store/dist/public");
  assert.equal(config.functions, undefined);
  assert.equal(config.installCommand, "pnpm install --frozen-lockfile");
  assert.equal(config.buildCommand, "pnpm run build:vercel");
  assert.deepEqual(config.routes, [
    { handle: "filesystem" },
    { src: "/.*", dest: "/index.html" },
  ]);
});

test("static frontend build output exists", async () => {
  await access(new URL("../artifacts/scene-store/dist/public/index.html", import.meta.url));
});

test("Vercel build does not compile or initialize the retired API", async () => {
  const source = await readFile(new URL("./build-vercel.mjs", import.meta.url), "utf8");
  assert.match(source, /@workspace\/scene-store/);
  assert.doesNotMatch(source, /@workspace\/api-server|STRIPE_|DATABASE_URL/);
});
