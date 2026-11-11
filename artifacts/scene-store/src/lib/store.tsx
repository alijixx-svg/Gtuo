import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { StoreProduct } from "./catalog";

type Ctx = {
  cart: StoreProduct[];
  favorites: StoreProduct[];
  inCart: (id: string) => boolean;
  isFav: (id: string) => boolean;
  addToCart: (p: StoreProduct) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleFav: (p: StoreProduct) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

function load(key: string): StoreProduct[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreProduct[]>(() => load("scene.cart"));
  const [favorites, setFav] = useState<StoreProduct[]>(() => load("scene.favorites"));
  useEffect(() => localStorage.setItem("scene.cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("scene.favorites", JSON.stringify(favorites)), [favorites]);

  const addToCart = useCallback((p: StoreProduct) => setCart((c) => (c.some((x) => x.id === p.id) ? c : [...c, p].slice(0, 20))), []);
  const removeFromCart = useCallback((id: string) => setCart((c) => c.filter((x) => x.id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleFav = useCallback(
    (p: StoreProduct) => setFav((f) => (f.some((x) => x.id === p.id) ? f.filter((x) => x.id !== p.id) : [p, ...f])),
    [],
  );
  const value = useMemo(
    () => ({
      cart,
      favorites,
      inCart: (id: string) => cart.some((x) => x.id === id),
      isFav: (id: string) => favorites.some((x) => x.id === id),
      addToCart,
      removeFromCart,
      clearCart,
      toggleFav,
    }),
    [cart, favorites, addToCart, removeFromCart, clearCart, toggleFav],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export const money = (n: number) => `$${n.toFixed(2)}`;
export const catLabel = (c: string) => (c === "movie" ? "فيلم" : "لعبة");
export const discount = (p: StoreProduct) =>
  p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
