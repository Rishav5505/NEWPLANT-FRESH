import { Link } from "react-router-dom";
import { GitCompare, X, Star } from "lucide-react";
import { Button, EmptyState } from "../components/ui";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import { formatINR, hdImage, discountPct, plainText } from "../lib/format";
import { careHints, categoryBySlug, fallbackImage } from "../lib/catalog";

export default function Compare() {
  const { items, toggle, clear } = useCompare();
  const { add } = useCart();
  const { enrich } = useCatalog();
  const list = items.map(enrich);

  if (list.length === 0) {
    return (
      <div className="container-x py-24">
        <EmptyState icon={GitCompare} title="Nothing to compare yet" text="Tap “Compare” on up to three products to see them side by side." action={<Button to="/shop">Browse plants</Button>} />
      </div>
    );
  }

  const rows = [
    ["Price", (p) => <span className="font-display text-2xl">{formatINR(p.price)}</span>],
    ["You save", (p) => (discountPct(p.price, p.oldPrice) ? <span className="font-semibold text-clay">{discountPct(p.price, p.oldPrice)}% off {formatINR(p.oldPrice)}</span> : "—")],
    ["Rating", (p) => (p.rating ? <span className="inline-flex items-center gap-1"><Star className="size-4 fill-clay text-clay" /> {Number(p.rating).toFixed(1)} ({p.reviewCount})</span> : "No reviews yet")],
    ["Collection", (p) => categoryBySlug(p.category)?.title || "—"],
    ["Light", (p) => careHints(p.name)?.light || "—"],
    ["Water", (p) => careHints(p.name)?.water || "—"],
    ["Care level", (p) => careHints(p.name)?.level || "—"],
    ["Popularity", (p) => (p.bestseller ? "Bestseller" : p.sold ? `${p.sold} sold` : "—")],
    ["About", (p) => <span className="line-clamp-5 text-sm text-muted">{plainText(p.description) || "—"}</span>],
  ];

  return (
    <section className="container-x py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Compare</p>
          <h1 className="text-5xl font-light md:text-6xl">Side by <em className="text-moss">side</em></h1>
        </div>
        <Button variant="outline" size="sm" onClick={clear}>Clear all</Button>
      </div>
      <div className="overflow-x-auto rounded-[32px] border border-line">
        <table className="w-full table-fixed text-sm" style={{ minWidth: 96 + list.length * 168 }}>
          <thead>
            <tr>
              <th className="w-24 bg-surface p-3 sm:w-36 sm:p-4" />
              {list.map((p) => (
                <th key={p.id} className="relative p-3 text-left align-top font-normal sm:p-4">
                  <button onClick={() => toggle(p)} className="absolute top-5 right-5 z-10 sm:top-6 sm:right-6 grid size-8 place-items-center rounded-full bg-white/90 text-[#16301f] shadow" aria-label={`Remove ${p.name}`}><X className="size-4" /></button>
                  <Link to={`/product/${p.id}`} className="block overflow-hidden rounded-2xl bg-surface-2">
                    <img src={hdImage(p.image, 500)} data-fallback={fallbackImage()} alt={p.name} className="aspect-square w-full object-cover" />
                  </Link>
                  <Link to={`/product/${p.id}`} className="mt-3 line-clamp-2 block font-semibold hover:text-moss">{p.name}</Link>
                  <Button size="sm" className="mt-3 w-full" disabled={p.stock === 0} onClick={() => add(p)}>{p.stock === 0 ? "Sold out" : "Add to basket"}</Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(([label, render]) => (
              <tr key={label}>
                <th className="bg-surface p-3 text-left text-[11px] font-bold tracking-wider text-muted uppercase sm:p-4 sm:text-xs">{label}</th>
                {list.map((p) => <td key={p.id} className="p-3 align-top sm:p-4">{render(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
