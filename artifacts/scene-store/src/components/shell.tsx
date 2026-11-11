import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Heart, ShoppingBag, Clapperboard } from "lucide-react";
import { useStore } from "@/lib/store";

export function Shell({ children }: { children: ReactNode }) {
  const { cart, favorites } = useStore();
  const [loc] = useLocation();
  const nav = (href: string, label: string, icon: ReactNode, count: number, id: string) => (
    <Link
      href={href}
      data-testid={`link-${id}`}
      className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
        loc === href ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && (
        <span key={count} className="pop grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 font-mono text-[11px] text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="bg-secondary text-secondary-foreground text-xs overflow-hidden whitespace-nowrap py-1.5">
        <div className="marquee inline-block">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="px-4">
              نسخة عرض فقط — بدون دفع أو طلبات · الأسعار توضيحية بالدولار · لا تُسلَّم تراخيص أو مفاتيح تفعيل · سهرة سينما أم مغامرة لعب؟ اختر مشهدك الليلة ·
            </span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" data-testid="link-home" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground rotate-[-6deg]">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-bold leading-none">
              سين<span className="block font-mono text-[10px] tracking-[.35em] text-muted-foreground">SCENE</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav("/", "المتجر", <Clapperboard className="h-4 w-4" />, 0, "store")}
            {nav("/favorites", "المفضلة", <Heart className="h-4 w-4" />, favorites.length, "favorites")}
            {nav("/cart", "السلة", <ShoppingBag className="h-4 w-4" />, cart.length, "cart")}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 border-t bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="font-display text-3xl">سين — من الكويت، لكل سهرة.</p>
            <p className="mt-2 max-w-xl text-sm opacity-75">
              كتالوج توضيحي لأغراض العرض والتصفح فقط. لا تتوفر عمليات شراء أو دفع أو تسجيل طلبات، ولا تُسلَّم تراخيص أو تنزيلات أو مفاتيح تفعيل.
            </p>
          </div>
          <p className="font-mono text-xs opacity-60 md:text-left">SCENE / SHOWCASE / KW</p>
        </div>
      </footer>
    </div>
  );
}
