import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "../stripeClient";
import { logger } from "./logger";

export async function initializeStripe(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  await runMigrations({ databaseUrl: process.env.DATABASE_URL });
  const sync = await getStripeSync();
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (!domain) throw new Error("Application domain is missing");
  await sync.findOrCreateManagedWebhook(`https://${domain}/api/stripe/webhook`);
  await sync.syncBackfill({ object: "all" });
  logger.info("Stripe initialized in test mode");
}
