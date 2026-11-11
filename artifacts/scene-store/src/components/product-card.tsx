import { Link } from "wouter";
import { Heart, Plus, Check, Star } from "lucide-react";
import type { StoreProduct } from "@/lib/catalog";
import { useStore, money, catLabel, discount } from "@/lib/store";

export function ProductCard({ p, i = 0 }: { p: StoreProduct; i?: number }) {
  const { inCart, isFav, addToCart, removeFromCart, toggleFav } = useStore();
  const off = discount(p);
  const fav = isFav(p.id);
  const added = inCart(p.id);
  return (
    <article data-testid={`card-product-${p.id}`} className="rise group relative" style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
      <Link href={`/product/${p.id}`} data-testid={`link-product-${p.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary shadow-[0_10px_30px_-12px_hsl(192_45%_13%/.45)]">
          <img src={p.imageUrl} alt={p.titleAr} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-80" />
          <div className="absolute top-3 right-3 flex flex-col items-start gap-1">
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-bold">{catLabel(p.category)}</span>
            {off > 0 && <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[11px] text-primary-foreground">-{off}%</span>}
          </div>
          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-secondary-foreground">
            <span className="flex items-center gap-1 font-mono text-xs"><Star className="h-3 w-3 fill-accent text-accent" />{p.rating.toFixed(1)}</span>
            <span className="font-mono text-xs opacity-80">{p.year}</span>
          </div>
        </div>
      </Link>
      <button
        data-testid={`button-favorite-${p.id}`}
        aria-label="مفضلة"
        onClick={() => toggleFav(p)}
        className="absolute top-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 transition-transform active:scale-90"
      >
        <Heart key={String(fav)} className={`h-4 w-4 ${fav ? "pop fill-primary text-primary" : ""}`} />
      </button>
      <div className="mt-3 flex items-start justify-between gap-2">
        <Link href={`/product/${p.id}`} className="min-w-0">
          <h3 className="truncate font-bold leading-tight">{p.titleAr}</h3>
          <p dir="ltr" className="truncate text-right text-xs text-muted-foreground">{p.title} · {p.genre}</p>
        </Link>
        <button
          data-testid={`button-cart-${p.id}`}
          onClick={() => (added ? removeFromCart(p.id) : addToCart(p))}
          aria-label={added ? "إزالة من السلة" : "أضف للسلة"}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all active:scale-90 ${added ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:rotate-90"}`}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-1 flex items-baseline gap-2 font-mono">
        <span className="font-bold">{money(p.price)}</span>
        {off > 0 && <span className="text-xs text-muted-foreground line-through">{money(p.originalPrice)}</span>}
      </div>
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div>
      <div className="aspect-[2/3] animate-pulse rounded-2xl bg-muted" />
      <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function ErrorBox({ onRetry, text = "تعذّر تحميل البيانات." }: { onRetry: () => void; text?: string }) {
  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
      <p className="font-bold text-destructive">{text}</p>
      <button data-testid="button-retry" onClick={onRetry} className="mt-3 rounded-full bg-secondary px-5 py-2 text-sm text-secondary-foreground">
        إعادة المحاولة
      </button>
    </div>
  );
}
