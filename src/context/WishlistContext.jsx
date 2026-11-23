import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WishCtx = createContext(null);
const KEY = "jl_wishlist";

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

// Wishlist lives in localStorage for guests and is synced to the account once signed in.
export function WishlistProvider({ children }) {
  const [items, setItems] = useState(load);
  const { user } = useAuth();
  const toast = useToast();
  const synced = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  // On sign-in: merge local items into the server wishlist, then adopt the server copy.
  useEffect(() => {
    if (!user || synced.current === user._id) return;
    synced.current = user._id;
    const local = load();
    api("/api/wishlist/merge", { method: "POST", auth: true, body: { items: local } })
      .then((d) => Array.isArray(d.items) && setItems(d.items))
      .catch(() => {
        /* backend without wishlist support — keep local copy */
      });
  }, [user]);

  const has = useCallback((id) => items.some((p) => p.id === id), [items]);

  const toggle = useCallback(
    (product) => {
      const exists = items.some((p) => p.id === product.id);
      const entry = { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category };
      setItems((prev) => (exists ? prev.filter((p) => p.id !== product.id) : [...prev, entry]));
      toast?.(exists ? "Removed from wishlist" : "Saved to your wishlist", "info");
      if (user) {
        api(exists ? `/api/wishlist/${product.id}` : "/api/wishlist", {
          method: exists ? "DELETE" : "POST",
          auth: true,
          body: exists ? undefined : entry,
        }).catch(() => {});
      }
    },
    [items, toast, user]
  );

  return <WishCtx.Provider value={{ items, has, toggle }}>{children}</WishCtx.Provider>;
}

export const useWishlist = () => useContext(WishCtx);
