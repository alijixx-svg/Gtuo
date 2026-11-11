import { pool } from "@workspace/db";
import { GetStoreProductResponse } from "@workspace/api-zod";
import { getUncachableStripeClient } from "../stripeClient";

export type CatalogProduct = ReturnType<typeof GetStoreProductResponse.parse>;

export async function getCatalog(): Promise<(CatalogProduct & { priceId: string; rank: number })[]> {
  // Serverless mode reads the same Stripe source of truth directly. This avoids
  // relying on Replit's managed sync worker or creating a stripe schema in an
  // external Supabase database just to display the catalog.
  if (process.env.VERCEL === "1") {
    const stripe = await getUncachableStripeClient();
    const products = await stripe.products.list({
      active: true, limit: 100, expand: ["data.default_price"],
    });
    return products.data.filter(p => p.metadata.scene_store === "true").map(p => {
      const m = p.metadata;
      const price = p.default_price;
      if (!price || typeof price === "string" || !price.active || price.unit_amount == null) {
        throw new Error("A SCENE product is missing its active Stripe price");
      }
      const product = GetStoreProductResponse.parse({
        id: p.id, slug: m.slug, title: p.name, titleAr: m.titleAr,
        description: p.description ?? "", category: m.category, genre: m.genre,
        price: price.unit_amount / 100, originalPrice: Number(m.originalPrice),
        currency: price.currency, imageUrl: m.imageUrl, backdropUrl: m.backdropUrl,
        year: Number(m.year), rating: Number(m.rating), platform: m.platform,
        featured: m.featured === "true", badge: m.badge ?? "",
      });
      return { ...product, priceId: price.id, rank: Number(m.rank) };
    }).sort((a, b) => a.rank - b.rank);
  }
  const { rows } = await pool.query(`
    SELECT p.id, p.name, p.description, p.metadata,
      pr.id AS price_id, pr.unit_amount, pr.currency
    FROM stripe.products p
    JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
    WHERE p.active = true AND p.metadata->>'scene_store' = 'true'
      AND pr.id = p.default_price
    ORDER BY (p.metadata->>'rank')::integer
    LIMIT 100
  `);
  return rows.map(row => {
    const m = row.metadata ?? {};
    const product = GetStoreProductResponse.parse({
      id: row.id, slug: m.slug, title: row.name, titleAr: m.titleAr,
      description: row.description ?? "", category: m.category, genre: m.genre,
      price: Number(row.unit_amount) / 100, originalPrice: Number(m.originalPrice),
      currency: row.currency, imageUrl: m.imageUrl, backdropUrl: m.backdropUrl,
      year: Number(m.year), rating: Number(m.rating), platform: m.platform,
      featured: m.featured === "true", badge: m.badge ?? "",
    });
    return { ...product, priceId: row.price_id as string, rank: Number(m.rank) };
  });
}
