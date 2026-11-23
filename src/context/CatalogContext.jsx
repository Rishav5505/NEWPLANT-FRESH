import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { CATEGORIES, toProduct } from "../lib/catalog";

const CatalogCtx = createContext(null);

// Caches products per category so moving between pages is instant, plus
// today's deal and sales/rating stats used for badges and sorting.
export function CatalogProvider({ children }) {
  const [byCategory, setByCategory] = useState({});
  const [stats, setStats] = useState({});
  const [deal, setDeal] = useState(null);
  const inflight = useRef({});

  useEffect(() => {
    api("/api/stats/plants").then((d) => setStats(d.stats || {})).catch(() => {});
    api("/api/deal").then((d) => setDeal(d.deal || null)).catch(() => {});
  }, []);

  const loadCategory = useCallback((slug) => {
    if (inflight.current[slug]) return inflight.current[slug];
    const p = api(`/api/plants/${slug}`)
      .then((d) => {
        const list = (d.plants || []).map(toProduct);
        setByCategory((s) => ({ ...s, [slug]: list }));
        return list;
      })
      .catch((e) => {
        delete inflight.current[slug];
        throw e;
      });
    inflight.current[slug] = p;
    return p;
  }, []);

  const loadAll = useCallback(() => Promise.allSettled(CATEGORIES.map((c) => loadCategory(c.slug))), [loadCategory]);

  // Decorate a product with today's deal price and its sales/rating stats.
  const enrich = useCallback(
    (p) => {
      if (!p) return p;
      const s = stats[String(p.id)];
      let out = s ? { ...p, sold: s.sold, soldThisWeek: s.week, bestseller: !!s.bestseller, rating: p.rating ?? s.rating, reviewCount: p.reviewCount || s.reviews } : p;
      if (deal && String(deal.productId) === String(p.id) && !p.isDeal) {
        out = { ...out, isDeal: true, oldPrice: Math.max(p.oldPrice || 0, p.price), price: deal.dealPrice, dealEndsAt: deal.endsAt };
      }
      return out;
    },
    [stats, deal]
  );

  const findById = useCallback(
    (id) => {
      for (const list of Object.values(byCategory)) {
        const hit = list.find((p) => String(p.id) === String(id));
        if (hit) return hit;
      }
      return null;
    },
    [byCategory]
  );

  const dealProduct = deal ? enrich(toProduct(deal.plant)) : null;

  return <CatalogCtx.Provider value={{ byCategory, loadCategory, loadAll, findById, stats, deal, dealProduct, enrich }}>{children}</CatalogCtx.Provider>;
}

export const useCatalog = () => useContext(CatalogCtx);
