import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { Button } from "./ui";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { formatINR, hdImage } from "../lib/format";
import { fallbackImage } from "../lib/catalog";

// Pick a stable "random" item for this product so suggestions don't reshuffle.
const pickFor = (list, seed) => {
  if (!list.length) return null;
  let h = 0;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return list[h % list.length];
};

// "Complete the set": this plant + a planter + a care kit, added in one tap.
export default function BoughtTogether({ product }) {
  const { byCategory, loadCategory, enrich } = useCatalog();
  const { addMany } = useCart();
  const [off, setOff] = useState({});

  useEffect(() => {
    loadCategory("planters").catch(() => {});
    loadCategory("care-kits").catch(() => {});
  }, [loadCategory]);

  const set = useMemo(() => {
    const ok = (p) => p.image && p.price > 0 && p.stock !== 0;
    const pot = pickFor((byCategory.planters || []).filter((p) => ok(p) && p.price <= 1200 && /pot|planter/i.test(p.name)), product.id);
    const kit = pickFor((byCategory["care-kits"] || []).filter((p) => ok(p) && p.price <= 1500), product.id + "k");
    return [product, pot, kit].filter(Boolean).map(enrich);
  }, [byCategory, product, enrich]);

  if (set.length < 2) return null;
  const chosen = set.filter((p) => !off[p.id]);
  const total = chosen.reduce((s, p) => s + p.price, 0);

  return (
    <section className="container-x pb-16">
      <div className="rounded-[32px] border border-line p-6 md:p-8">
        <p className="eyebrow mb-2">Complete the set</p>
        <h2 className="text-3xl">Frequently bought <em className="text-moss">together</em></h2>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {set.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                {i > 0 && <Plus className="size-5 text-muted" />}
                <label className={`relative block w-28 cursor-pointer sm:w-36 ${off[p.id] ? "opacity-40" : ""}`}>
                  <img src={hdImage(p.image, 300)} data-fallback={fallbackImage()} alt={p.name} className="aspect-square w-full rounded-2xl bg-surface-2 object-cover" />
                  <input type="checkbox" className="sr-only" checked={!off[p.id]} disabled={i === 0} onChange={() => setOff((o) => ({ ...o, [p.id]: !o[p.id] }))} aria-label={`Include ${p.name}`} />
                  <span className={`absolute top-2 left-2 grid size-6 place-items-center rounded-full border-2 ${off[p.id] ? "border-white bg-white/70" : "border-forest bg-forest text-on-forest"}`}>{!off[p.id] && <Check className="size-3.5" />}</span>
                </label>
              </div>
            ))}
          </div>
          <div className="lg:w-72">
            <ul className="space-y-2 text-sm">
              {set.map((p, i) => (
                <li key={p.id} className={`flex justify-between gap-3 ${off[p.id] ? "text-muted line-through" : ""}`}>
                  {i === 0 ? <span className="line-clamp-1">This item: {p.name}</span> : <Link to={`/product/${p.id}`} className="line-clamp-1 hover:text-moss">{p.name}</Link>}
                  <span className="shrink-0 font-semibold">{formatINR(p.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-muted">Total</span>
              <span className="font-display text-3xl">{formatINR(total)}</span>
            </p>
            <Button className="mt-4 w-full" disabled={product.stock === 0} onClick={() => addMany(chosen)}>Add {chosen.length} to basket</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
