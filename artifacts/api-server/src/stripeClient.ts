import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";

async function getStripeCredentials(): Promise<{
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
}> {
  // Vercel does not have the Replit connector identity. Server-only environment
  // variables provide portable credentials; never prefix them with VITE_.
  if (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_PUBLISHABLE_KEY || process.env.VERCEL === "1") {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!secretKey || !publishableKey) throw new Error("Stripe test configuration is incomplete");
    if (!/^(sk|rk)_test_/.test(secretKey) || !publishableKey.startsWith("pk_test_")) {
      throw new Error("SCENE only supports Stripe test mode");
    }
    return { secretKey, publishableKey, webhookSecret: process.env.STRIPE_WEBHOOK_SECRET };
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const token = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;
  if (!hostname || !token) throw new Error("Stripe connection is unavailable");
  const response = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: token },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) throw new Error(`Stripe connection error: ${response.status}`);
  const data = await response.json() as { items?: { settings?: Record<string, string> }[] };
  const settings = data.items?.[0]?.settings;
  const secretKey = settings?.secret_key ?? settings?.secret;
  const publishableKey = settings?.publishable_key ?? settings?.publishable;
  if (!secretKey || !publishableKey) {
    throw new Error("Stripe connection is missing its configuration");
  }
  // This training store must never accept real payments, even when published.
  if (!/^(sk|rk)_test_/.test(secretKey)) {
    throw new Error("SCENE only supports Stripe test mode");
  }
  return {
    secretKey,
    publishableKey,
    webhookSecret: settings?.webhook_secret,
  };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe((await getStripeCredentials()).secretKey);
}

export async function getStripePublishableKey(): Promise<string> {
  return (await getStripeCredentials()).publishableKey;
}

export async function getStripeSync(): Promise<StripeSync> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const keys = await getStripeCredentials();
  return new StripeSync({
    poolConfig: { connectionString: process.env.DATABASE_URL },
    stripeSecretKey: keys.secretKey,
    stripeWebhookSecret: keys.webhookSecret ?? "",
  });
}
