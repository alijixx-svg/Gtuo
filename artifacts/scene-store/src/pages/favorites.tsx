import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";

export default function Favorites() {
  const { favorites } = useStore();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="font-mono text-xs tracking-[.4em] text-primary">WATCHLIST</p>
      <h1 className="font-display mt-2 text-5xl">مفضلتك</h1>
      {favorites.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed p-14 text-center">
          <Heart className="mx-auto h-10 w-10 text-primary" />
          <p className="font-display mt-4 text-3xl">قائمتك فاضية للحين.</p>
          <p className="mt-2 text-muted-foreground">اضغط على القلب في أي عنوان ليحفظ هنا على جهازك.</p>
          <Link href="/" data-testid="link-browse" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">تصفّح المتجر</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {favorites.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      )}
    </div>
  );
}
