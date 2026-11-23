import { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { getRecent } from "../lib/recent";
import { formatINR, hdImage } from "../lib/format";
import { fallbackImage } from "../lib/catalog";

// Horizontal strip of products this visitor looked at recently.
export default function RecentlyViewed({ excludeId, title = "Recently viewed" }) {
  const [items] = useState(() => getRecent().filter((p) => p.id !== excludeId).slice(0, 8));
  if (items.length === 0) return null;
  return (
    <section className="container-x py-14">
      <h2 className="mb-6 flex items-center gap-3 text-3xl"><History className="size-6 text-clay" /> {title}</h2>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="group w-40 shrink-0 snap-start sm:w-48">
            <div className="aspect-square overflow-hidden rounded-2xl bg-surface-2">
              <img src={hdImage(p.image, 400)} data-fallback={fallbackImage(p.category)} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <p className="mt-3 line-clamp-2 text-sm font-semibold group-hover:text-moss">{p.name}</p>
            <p className="mt-1 text-sm text-muted">{formatINR(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
