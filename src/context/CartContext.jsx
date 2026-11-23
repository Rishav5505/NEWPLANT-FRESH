import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "./ToastContext";

const CartCtx = createContext(null);
const KEY = "jl_cart";

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const add = useCallback(
    (product, qty = 1) => {
      setItems((prev) => {
        const found = prev.find((p) => p.id === product.id);
        if (found) return prev.map((p) => (p.id === product.id ? { ...p, quantity: Math.min(20, p.quantity + qty) } : p));
        return [
          ...prev,
          { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: qty },
        ];
      });
      // The drawer opening is the confirmation — a toast here would cover its checkout button on mobile.
      setOpen(true);
    },
    []
  );

  // Add several products at once (Buy again, Move wishlist to basket).
  const addMany = useCallback(
    (products) => {
      setItems((prev) => {
        const next = [...prev];
        for (const product of products) {
          const i = next.findIndex((p) => p.id === product.id);
          const qty = product.quantity || 1;
          if (i >= 0) next[i] = { ...next[i], quantity: Math.min(20, next[i].quantity + qty) };
          else next.push({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: qty });
        }
        return next;
      });
      toast?.(`${products.length} item${products.length === 1 ? "" : "s"} added to your basket`);
      setOpen(true);
    },
    [toast]
  );

  const update = useCallback((id, quantity) => {
    setItems((prev) => (quantity <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, quantity: Math.min(20, quantity) } : p))));
  }, []);

  const remove = useCallback((id) => setItems((prev) => prev.filter((p) => p.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return <CartCtx.Provider value={{ items, add, addMany, update, remove, clear, count, open, setOpen }}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
