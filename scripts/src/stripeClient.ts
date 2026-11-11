import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";

async function getStripeCredentials() {
  if (process.env.STRIPE_SECRET_KEY || process.env.VERCEL === "1") {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || !/^(sk|rk)_test_/.test(secretKey)) {
      throw new Error("SCENE requires a Stripe test-mode connection");
    }
    return { secretKey, webhookSecret: process.env.STRIPE_WEBHOOK_SECRET };
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
  if (!secretKey) throw new Error("Stripe configuration is missing its secret key");
  if (!/^(sk|rk)_test_/.test(secretKey)) {
    throw new Error("SCENE requires a Stripe test-mode connection (live-mode credentials rejected)");
  }
  return {
    secretKey,
    webhookSecret: settings?.webhook_secret,
  };
}

export async function getUncachableStripeClient() {
  return new Stripe((await getStripeCredentials()).secretKey);
}

export async function getStripeSync() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const keys = await getStripeCredentials();
  return new StripeSync({
    poolConfig: { connectionString: process.env.DATABASE_URL },
    stripeSecretKey: keys.secretKey,
    stripeWebhookSecret: keys.webhookSecret ?? "",
  });
}
