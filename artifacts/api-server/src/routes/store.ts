import { Router, type IRouter, type Request, type Response } from "express";
import { createHash, randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  ListStoreProductsQueryParams, ListStoreProductsResponse,
  GetStoreProductParams, GetStoreProductResponse, GetStoreHighlightsResponse,
  CreateStoreCheckoutBody, CreateStoreCheckoutResponse,
  ConfirmStoreCheckoutParams, ConfirmStoreCheckoutResponse,
} from "@workspace/api-zod";
import { getCatalog } from "../lib/catalog";
import { getStripePublishableKey, getUncachableStripeClient } from "../stripeClient";

const router: IRouter = Router();
const cookieName = "scene_checkout_owner";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function getOwner(req: Request, res: Response): string {
  let owner = req.cookies?.[cookieName];
  if (typeof owner !== "string" || !/^[a-f0-9-]{36}$/.test(owner)) {
    owner = randomUUID();
    res.cookie(cookieName, owner, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/api/store",
    });
  }
  return hash(owner);
}

// Bound creation attempts; never log checkout secrets or card details.
const attempts = new Map<string, { count: number; reset: number }>();
function paymentRateLimit(req: Request, res: Response): boolean {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || entry.reset < now) {
    entry = { count: 0, reset: now + 60000 };
    attempts.set(key, entry);
  }
  if (++entry.count > 15) {
    res.status(429).json({ error: "محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة." });
    return false;
  }
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (v.reset < now) attempts.delete(k);
  }
  return true;
}

router.get("/store/products", async (req, res): Promise<void> => {
  // Explicitly parse booleans: z.coerce.boolean() treats the string "false" as true.
  const query = ListStoreProductsQueryParams.safeParse({
    ...req.query,
    deals: req.query.deals == null ? undefined : req.query.deals === "true",
  });
  if (!query.success) { res.status(400).json({ error: "خيارات البحث غير صحيحة" }); return; }
  const { category, q, sort, deals } = query.data;
  let products = await getCatalog();
  if (category && category !== "all") products = products.filter(p => p.category === category);
  if (q?.trim()) {
    const needle = q.trim().toLocaleLowerCase();
    products = products.filter(p => `${p.title} ${p.titleAr} ${p.genre}`.toLocaleLowerCase().includes(needle));
  }
  if (deals) products = products.filter(p => p.originalPrice > p.price);
  if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  if (sort === "newest") products.sort((a, b) => b.year - a.year);
  res.json(ListStoreProductsResponse.parse(products));
});

router.get("/store/highlights", async (_req, res): Promise<void> => {
  const products = await getCatalog();
  res.json(GetStoreHighlightsResponse.parse({
    featured: products.filter(p => p.featured),
    trending: [...products].sort((a, b) => b.rating - a.rating).slice(0, 6),
    movieCount: products.filter(p => p.category === "movie").length,
    gameCount: products.filter(p => p.category === "game").length,
    dealsCount: products.filter(p => p.originalPrice > p.price).length,
  }));
});

router.get("/store/products/:id", async (req, res): Promise<void> => {
  const parsed = GetStoreProductParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: "منتج غير صحيح" }); return; }
  const product = (await getCatalog()).find(p => p.id === parsed.data.id || p.slug === parsed.data.id);
  if (!product) { res.status(404).json({ error: "المنتج غير موجود" }); return; }
  res.json(GetStoreProductResponse.parse(product));
});

router.post("/store/checkout", async (req, res): Promise<void> => {
  if (!paymentRateLimit(req, res)) return;
  const input = CreateStoreCheckoutBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ error: "السلة غير صحيحة" }); return; }
  const ids = [...new Set(input.data.productIds)];
  const catalog = await getCatalog();
  const items = ids.map(id => catalog.find(p => p.id === id));
  if (items.some(item => !item)) { res.status(400).json({ error: "بعض المنتجات غير متوفرة" }); return; }
  const products = items.filter(item => item != null);
  const ownerHash = getOwner(req, res);
  const orderId = randomUUID();
  try {
    const stripe = await getUncachableStripeClient();
    const publishableKey = await getStripePublishableKey();
    const snapshots = products.map(p => GetStoreProductResponse.parse(p));
    await db.insert(ordersTable).values({
      id: orderId, ownerHash, items: snapshots,
      totalCents: products.reduce((sum, p) => sum + Math.round(p.price * 100), 0),
    });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      allowed_payment_method_types: ["card"],
      line_items: products.map(p => ({ price: p.priceId, quantity: 1 })),
      metadata: { scene_order_id: orderId, scene_store: "true" },
      payment_intent_data: { metadata: { scene_order_id: orderId } },
      locale: "auto",
    }, { idempotencyKey: `scene-order-${orderId}` });
    if (session.livemode || !session.client_secret) throw new Error("Invalid test checkout session");
    await db.update(ordersTable).set({ sessionId: session.id }).where(eq(ordersTable.id, orderId));
    res.status(201).json(CreateStoreCheckoutResponse.parse({
      clientSecret: session.client_secret, publishableKey, sessionId: session.id, orderId,
    }));
  } catch (error: unknown) {
    const details = error as { type?: string; code?: string; param?: string; message?: string };
    req.log.error({
      type: details.type, code: details.code, param: details.param,
      message: details.message?.replace(/(?:sk|rk|pk)_(?:test|live)_[a-zA-Z0-9]+/g, "[redacted]").slice(0, 400),
    }, "Could not create Stripe test checkout");
    res.status(503).json({ error: "تعذّر فتح الدفع التجريبي. حاول مرة ثانية." });
  }
});

router.post("/store/checkout/:sessionId/confirm", async (req, res): Promise<void> => {
  const params = ConfirmStoreCheckoutParams.safeParse(req.params);
  const owner = req.cookies?.[cookieName];
  if (!params.success || typeof owner !== "string") {
    res.status(404).json({ error: "الطلب غير موجود في هذه الجلسة" }); return;
  }
  const [order] = await db.select().from(ordersTable).where(and(
    eq(ordersTable.sessionId, params.data.sessionId),
    eq(ordersTable.ownerHash, hash(owner)),
  ));
  if (!order) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(params.data.sessionId);
  if (session.livemode || session.metadata?.scene_order_id !== order.id ||
    session.amount_total !== order.totalCents || session.currency !== order.currency) {
    res.status(409).json({ error: "تعذّر التحقق من بيانات الدفع" }); return;
  }
  if (session.payment_status !== "paid") {
    res.status(409).json({ error: "الدفع لم يكتمل بعد. جرّب التحقق مرة ثانية." }); return;
  }
  if (order.status !== "paid") {
    await db.update(ordersTable).set({ status: "paid", paidAt: new Date() }).where(eq(ordersTable.id, order.id));
  }
  res.json(ConfirmStoreCheckoutResponse.parse({
    id: order.id, status: "paid", total: order.totalCents / 100, currency: order.currency,
    items: order.items, createdAt: order.createdAt.toISOString(), testMode: true,
  }));
});

export default router;
