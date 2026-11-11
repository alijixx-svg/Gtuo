import { Link } from "wouter";
import { Trash2, ShoppingBag, Info } from "lucide-react";
import { useStore, money, catLabel } from "@/lib/store";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useStore();
  const total = cart.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="font-mono text-xs tracking-[.4em] text-primary">YOUR PICKS</p>
      <h1 className="font-display mt-2 text-5xl">السلة</h1>
      <p className="mt-3 text-muted-foreground">قائمتك المختارة محفوظة على جهازك فقط.</p>
      {cart.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed p-14 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
          <p className="font-display mt-4 text-3xl">السلة فاضية.</p>
          <p className="mt-2 text-muted-foreground">الليلة طويلة — اختر فيلم أو لعبة.</p>
          <Link href="/" data-testid="link-browse" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">تصفّح المتجر</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <ul className="space-y-3">
            {cart.map(p => (
              <li key={p.id} data-testid={`row-cart-${p.id}`} className="flex items-center gap-4 rounded-2xl border bg-card p-3">
                <Link href={`/product/${p.id}`}><img src={p.imageUrl} alt={p.titleAr} className="h-24 w-16 rounded-lg object-cover" /></Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.id}`} className="block truncate font-bold">{p.titleAr}</Link>
                  <p className="text-xs text-muted-foreground">{catLabel(p.category)} · {p.genre}</p>
                  <p className="mt-1 font-mono font-bold">{money(p.price)}</p>
                </div>
                <button data-testid={`button-remove-${p.id}`} onClick={() => removeFromCart(p.id)} aria-label={`إزالة ${p.titleAr}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex justify-between text-sm text-muted-foreground"><span>العناصر</span><span>{cart.length}</span></div>
              <div className="mt-2 flex justify-between text-xl font-bold"><span>المجموع التوضيحي</span><span data-testid="text-cart-total" className="font-mono">{money(total)}</span></div>
              <div data-testid="display-only-notice" className="mt-5 rounded-xl bg-accent/20 p-4 text-sm">
                <p className="flex items-center gap-2 font-bold"><Info className="h-4 w-4" /> نسخة عرض — بدون دفع</p>
                <p className="mt-2 leading-relaxed">لا تتوفر عمليات شراء أو تسجيل طلبات في هذه النسخة. لن يُخصم أي مبلغ، ولا يتم تسليم أفلام أو ألعاب.</p>
              </div>
              <Link href="/" className="mt-4 block rounded-full bg-primary py-3 text-center font-bold text-primary-foreground">متابعة التصفح</Link>
              <button data-testid="button-clear-cart" onClick={clearCart} className="mt-3 w-full rounded-full border py-2 text-sm">إفراغ السلة</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
