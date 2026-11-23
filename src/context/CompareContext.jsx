import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, GitCompare } from "lucide-react";
import { useToast } from "./ToastContext";
import { hdImage } from "../lib/format";
import { fallbackImage } from "../lib/catalog";

const CompareCtx = createContext(null);
const KEY = "jl_compare";
const MAX = 3;

export function CompareProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(v) ? v.slice(0, MAX) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const has = useCallback((id) => items.some((p) => p.id === id), [items]);
  const toggle = useCallback(
    (p) => {
      if (items.some((x) => x.id === p.id)) return setItems((l) => l.filter((x) => x.id !== p.id));
      if (items.length >= MAX) return toast?.(`You can compare up to ${MAX} products`, "error");
      setItems((l) => [...l, { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, image: p.image, category: p.category, description: p.description, stock: p.stock }]);
    },
    [items, toast]
  );
  const clear = useCallback(() => setItems([]), []);

  return <CompareCtx.Provider value={{ items, has, toggle, clear, max: MAX }}>{children}</CompareCtx.Provider>;
}

export const useCompare = () => useContext(CompareCtx);

// Floating tray shown while products are selected for comparison.
export function CompareTray() {
  const { items, toggle, clear } = useCompare();
  const { pathname } = useLocation();
  if (items.length === 0 || /^\/(compare|checkout|payment|admin)/.test(pathname)) return null;
  return (
    <div className="animate-fade-up fixed bottom-[8.5rem] left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-surface/95 p-2 pl-4 shadow-2xl backdrop-blur md:bottom-6">
      <GitCompare className="size-5 shrink-0 text-moss" />
      <div className="flex flex-1 -space-x-2 overflow-hidden">
        {items.map((p) => (
          <button key={p.id} onClick={() => toggle(p)} className="group relative" aria-label={`Remove ${p.name} from compare`}>
            <img src={hdImage(p.image, 100)} data-fallback={fallbackImage()} alt="" className="size-10 rounded-full border-2 border-surface object-cover" />
            <span className="absolute inset-0 hidden place-items-center rounded-full bg-black/50 text-white group-hover:grid"><X className="size-4" /></span>
          </button>
        ))}
      </div>
      <button onClick={clear} className="hidden text-xs font-semibold text-muted hover:text-clay sm:block">Clear</button>
      <Link to="/compare" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-on-forest">Compare {items.length}</Link>
    </div>
  );
}
