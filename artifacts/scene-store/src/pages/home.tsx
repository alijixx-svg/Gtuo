import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Search, Film, Gamepad2, Tag, LayoutGrid, ArrowLeft } from "lucide-react";
import {
  useListStoreProducts,
  useGetStoreHighlights,
  type ListStoreProductsParams,
} from "@/lib/catalog";
import { ProductCard, CardSkeleton, ErrorBox } from "@/components/product-card";
import { money } from "@/lib/store";

type Cat = "all" | "movie" | "game";
type Sort = "popular" | "price-asc" | "price-desc" | "newest";

export default function Home() {
  const [cat, setCat] = useState<Cat>("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [deals, setDeals] = useState(false);
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim().slice(0, 120)), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params: ListStoreProductsParams = { category: cat, sort, ...(dq ? { q: dq } : {}), ...(deals ? { deals: true } : {}) };
  const list = useListStoreProducts(params);
  const hi = useGetStoreHighlights();
  const hero = hi.data?.featured?.[0];

  const chip = (active: boolean, onClick: () => void, label: string, icon: React.ReactNode, id: string) => (
    <button
      data-testid={`button-filter-${id}`}
      onClick={onClick}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
        active ? "border-secondary bg-secondary text-secondary-foreground" : "bg-card hover:border-foreground/40"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={`${import.meta.env.BASE_URL}hero.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-secondary via-secondary/80 to-secondary/10" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
          <div className="rise text-secondary-foreground">
            <p className="font-mono text-xs tracking-[.4em] text-accent">TONIGHT / الليلة</p>
            <h1 className="font-display mt-4 text-5xl leading-[1.1] md:text-7xl">
              سهرة فيلم؟
              <br />
              <span className="text-primary">أو مغامرة</span> لعب؟
            </h1>
            <p className="mt-5 max-w-md text-base opacity-80">
              من شاشة الديوانية إلى جلسة اللعب مع الربع — اختر مشهدك الجاي من أفلام وألعاب مختارة.
            </p>
            <div className="mt-8 flex gap-6 font-mono text-sm">
              {hi.isLoading ? (
                <div className="h-10 w-64 animate-pulse rounded bg-background/20" />
              ) : hi.data ? (
                <>
                  <div><b className="block text-3xl text-accent">{hi.data.movieCount}</b>أفلام</div>
                  <div><b className="block text-3xl text-accent">{hi.data.gameCount}</b>ألعاب</div>
                  <div><b className="block text-3xl text-primary">{hi.data.dealsCount}</b>عروض</div>
                </>
              ) : null}
            </div>
          </div>
          {hero && (
            <Link href={`/product/${hero.id}`} data-testid="link-hero-product" className="rise group hidden md:block justify-self-start" style={{ animationDelay: "150ms" }}>
              <div className="relative w-64 rotate-[-4deg] transition-transform duration-500 group-hover:rotate-0">
                <img src={hero.imageUrl} alt={hero.titleAr} className="aspect-[2/3] w-full rounded-2xl object-cover shadow-2xl ring-4 ring-background/80" />
                <div className="ticket-edge absolute -bottom-6 -right-10 rounded-xl bg-accent px-5 py-3 text-accent-foreground shadow-xl">
                  <p className="text-xs font-bold">مختار الليلة</p>
                  <p className="font-display text-lg">{hero.titleAr}</p>
                  <p className="font-mono text-sm">{money(hero.price)}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {hi.data && hi.data.trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl">مختارات سين</h2>
            <span className="font-mono text-xs text-muted-foreground">SCENE PICKS</span>
          </div>
          <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-4">
            {hi.data.trending.map((p, i) => (
              <Link key={p.id} href={`/product/${p.id}`} data-testid={`link-trending-${p.id}`} className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-2xl bg-secondary">
                <img src={p.backdropUrl || p.imageUrl} alt={p.titleAr} loading="lazy" className="aspect-video w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute top-2 right-3 font-display text-6xl text-background/90 drop-shadow">{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary to-transparent p-3 text-secondary-foreground">
                  <p className="font-bold">{p.titleAr}</p>
                  <p className="font-mono text-xs opacity-75">{money(p.price)} · {p.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="catalog" className="mx-auto max-w-7xl px-4 pt-12">
        <h2 className="font-display text-3xl">الكتالوج</h2>
        <div className="sticky top-[65px] z-30 -mx-4 mt-4 border-b bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                data-testid="input-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن فيلم أو لعبة..."
                className="w-full rounded-full border bg-card py-2.5 pr-11 pl-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto">
              {chip(cat === "all", () => setCat("all"), "الكل", <LayoutGrid className="h-4 w-4" />, "all")}
              {chip(cat === "movie", () => setCat("movie"), "أفلام", <Film className="h-4 w-4" />, "movie")}
              {chip(cat === "game", () => setCat("game"), "ألعاب", <Gamepad2 className="h-4 w-4" />, "game")}
              {chip(deals, () => setDeals(!deals), "العروض", <Tag className="h-4 w-4" />, "deals")}
            </div>
            <select
              data-testid="select-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border bg-card px-4 py-2.5 text-sm"
            >
              <option value="popular">اختيارات سين</option>
              <option value="newest">الأحدث</option>
              <option value="price-asc">السعر: من الأقل</option>
              <option value="price-desc">السعر: من الأعلى</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          {list.isLoading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : list.isError ? (
            <ErrorBox onRetry={() => list.refetch()} text="تعذّر تحميل الكتالوج." />
          ) : list.data && list.data.length > 0 ? (
            <>
              <p data-testid="text-results-count" className="mb-4 font-mono text-xs text-muted-foreground">{list.data.length} نتيجة</p>
              <div className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 transition-opacity ${list.isFetching ? "opacity-60" : ""}`}>
                {list.data.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border-2 border-dashed p-12 text-center">
              <p className="font-display text-3xl">ما في مشهد بهالاسم.</p>
              <p className="mt-2 text-muted-foreground">جرّب كلمة ثانية أو امسح الفلاتر.</p>
              <button
                data-testid="button-reset-filters"
                onClick={() => { setQ(""); setCat("all"); setDeals(false); setSort("popular"); }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-primary-foreground"
              >
                مسح الفلاتر <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
