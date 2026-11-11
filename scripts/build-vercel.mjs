import { spawnSync } from "node:child_process";

// Vercel has no Replit workflow-provided PORT/BASE_PATH. These values are build
// settings only; no credentials, database queries or migrations run here.
const env = {
  ...process.env,
  NODE_ENV: "production",
  PORT: process.env.PORT || "4173",
  BASE_PATH: "/",
};

for (const args of [
  ["run", "typecheck"],
  ["--filter", "@workspace/scene-store", "run", "build"],
]) {
  const result = spawnSync("pnpm", args, { env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
