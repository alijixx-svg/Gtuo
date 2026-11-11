import { Link, useParams } from "wouter";
import { ArrowRight, Heart, ShoppingBag, Check, Star, Monitor, Calendar } from "lucide-react";
import {
  useGetStoreProduct,
  useListStoreProducts,
  type ListStoreProductsParams,
} from "@/lib/catalog";
import { useStore, money, catLabel, discount } from "@/lib/store";
import { ProductCard, ErrorBox } from "@/components/product-card";

export default function ProductPage() {
  const { id = "" } = useParams<{ id: string }>();
  const q = useGetStoreProduct(id);
  const p = q.data;
  const relParams: ListStoreProductsParams = { category: p?.category ?? "all", sort: "popular" };
  const rel = useListStoreProducts(relParams);
  const { inCart, isFav, addToCart, removeFromCart, toggleFav } = useStore();

  if (q.isLoading)
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[300px_1fr]">
        <div className="aspect-[2/3] animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4"><div className="h-12 w-2/3 animate-pulse rounded bg-muted" /><div className="h-24 animate-pulse rounded bg-muted" /></div>
      </div>
    );
  if (q.isError || !p)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorBox onRetry={() => q.refetch()} text="لم نجد هذا العنوان أو حدث خطأ في التحميل." />
        <Link href="/" className="mt-4 block text-center underline">العودة للمتجر</Link>
      </div>
    );

  const off = discount(p);
  const added = inCart(p.id);
  const fav = isFav(p.id);
  return (
    <div>
      <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <img src={p.backdropUrl || p.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <Link href="/" data-testid="link-back" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <ArrowRight className="h-4 w-4" /> العودة للمتجر
          </Link>
          <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr] md:items-end">
            <img src={p.imageUrl} alt={p.titleAr} className="rise mx-auto w-56 rounded-2xl shadow-2xl ring-4 ring-background/20 md:w-full" />
            <div className="rise" style={{ animationDelay: "120ms" }}>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-primary px-3 py-1">{catLabel(p.category)}</span>
                <span className="rounded-full bg-background/15 px-3 py-1">{p.genre}</span>
                {p.badge && <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">{p.badge}</span>}
              </div>
              <h1 data-testid="text-product-title" className="font-display mt-4 text-4xl md:text-6xl">{p.titleAr}</h1>
              <p dir="ltr" className="text-right font-mono text-sm opacity-70">{p.title}</p>
              <div className="mt-4 flex flex-wrap gap-5 font-mono text-sm opacity-90">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{p.rating.toFixed(1)}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{p.year}</span>
                {p.platform && <span className="flex items-center gap-1"><Monitor className="h-4 w-4" />{p.platform}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[1fr_360px]">
        <div>
          <h2 className="font-display text-2xl">عن العمل</h2>
          <p data-testid="text-product-description" className="mt-3 text-lg leading-loose">{p.description}</p>
          <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            نسخة عرض فقط. الأسعار توضيحية، ولا يتوفر شراء أو دفع أو تنزيل أو مفاتيح تفعيل.
          </p>
        </div>
        <aside className="ticket-edge h-fit rounded-2xl border bg-card p-6 md:sticky md:top-24">
          <div className="flex items-baseline gap-3 font-mono">
            <span data-testid="text-product-price" className="text-4xl font-bold">{money(p.price)}</span>
            {off > 0 && <span className="text-muted-foreground line-through">{money(p.originalPrice)}</span>}
            {off > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">-{off}%</span>}
          </div>
          <div className="my-5 border-t-2 border-dashed" />
          <button
            data-testid="button-toggle-cart"
            onClick={() => (added ? removeFromCart(p.id) : addToCart(p))}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3 font-bold transition-all active:scale-[.98] ${added ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}
          >
            {added ? <><Check className="h-5 w-5" /> في السلة — إزالة</> : <><ShoppingBag className="h-5 w-5" /> أضف للسلة</>}
          </button>
          {added && (
            <Link href="/cart" data-testid="link-go-cart" className="mt-2 block rounded-full border py-3 text-center font-bold hover:bg-muted">
              عرض السلة
            </Link>
          )}
          <button
            data-testid="button-toggle-favorite"
            onClick={() => toggleFav(p)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold hover:bg-muted"
          >
            <Heart key={String(fav)} className={`h-4 w-4 ${fav ? "pop fill-primary text-primary" : ""}`} />
            {fav ? "محفوظ في المفضلة" : "احفظ في المفضلة"}
          </button>
        </aside>
      </section>
      {rel.data && rel.data.filter((x) => x.id !== p.id).length > 0 && (
        <section className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-2xl">قد يعجبك أيضاً</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {rel.data.filter((x) => x.id !== p.id).slice(0, 5).map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
