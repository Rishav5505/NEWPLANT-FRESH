import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Sun, Droplets, Eye, Star, Flame, Award, GitCompare } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatINR, hdImage, discountPct } from "../lib/format";
import { careHints, fallbackImage } from "../lib/catalog";
import QuickView from "./QuickView";
import Tilt from "./Tilt";

export default function ProductCard({ product: raw, index }) {
  const { enrich } = useCatalog();
  const product = enrich(raw);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const compare = useCompare();
  const comparing = compare.has(product.id);
  const [quick, setQuick] = useState(false);
  const saved = has(product.id);
  const off = discountPct(product.price, product.oldPrice);
  const care = careHints(product.name);
  const soldOut = product.stock === 0;

  return (
    <article className="group flex flex-col">
      <Tilt className="rounded-[24px]">
        <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-[24px] bg-surface-2">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={product.image ? hdImage(product.image, 700) : fallbackImage(product.category)}
              data-fallback={fallbackImage(product.category)}
              srcSet={product.image ? `${hdImage(product.image, 500)} 500w, ${hdImage(product.image, 900)} 900w` : undefined}
              sizes="(min-width: 1024px) 25vw, 50vw"
              alt={product.name}
              loading="lazy"
              className={`size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06] ${soldOut ? "opacity-60 grayscale" : ""}`}
            />
          </div>
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {product.isDeal ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white shadow"><Flame className="size-3" /> Deal of the day</span>
            ) : product.bestseller ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16301f] px-2.5 py-1 text-[11px] font-bold text-[#f4f1e8] shadow"><Award className="size-3" /> Bestseller</span>
            ) : (
              index != null && <span className="rounded-full bg-white/85 px-2.5 py-1 font-display text-xs text-[#16301f] italic backdrop-blur">No. {String(index + 1).padStart(2, "0")}</span>
            )}
          </div>
          {soldOut ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#1b1f1a]/85 px-2.5 py-1 text-xs font-bold text-white">Sold out</span>
          ) : (
            off > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-clay px-2.5 py-1 text-xs font-bold text-white">−{off}%</span>
          )}
        </Link>

        <button
          onClick={() => toggle(product)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white/85 text-[#16301f] backdrop-blur transition hover:scale-110"
        >
          <Heart className={`size-[18px] ${saved ? "fill-clay text-clay" : ""}`} />
        </button>

        <button
          onClick={() => setQuick(true)}
          aria-label={`Quick view ${product.name}`}
          className="absolute right-3 bottom-3 hidden translate-y-2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#16301f] opacity-0 shadow-lg backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 md:inline-flex"
        >
          <Eye className="size-3.5" /> Quick view
        </button>
      </Tilt>

      <div className="flex flex-1 flex-col pt-4">
        <Link to={`/product/${product.id}`} className="line-clamp-2 text-[0.98rem] leading-snug font-semibold text-ink hover:text-moss">
          {product.name}
        </Link>
        {product.rating ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <Star className="size-3.5 fill-clay text-clay" /> <b className="text-ink">{Number(product.rating).toFixed(1)}</b> ({product.reviewCount})
          </p>
        ) : null}
        {care && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Sun className="size-3.5" />{care.light}</span>
            <span className="inline-flex items-center gap-1"><Droplets className="size-3.5" />{care.water}</span>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-bold text-ink">{formatINR(product.price)}</span>
            {off > 0 && <span className="text-sm text-muted line-through">{formatINR(product.oldPrice)}</span>}
          </div>
          <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => compare.toggle(product)}
            aria-pressed={comparing}
            aria-label={comparing ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
            title={comparing ? "Remove from compare" : "Compare"}
            className={`grid size-10 place-items-center rounded-full border transition ${comparing ? "border-moss bg-moss/15 text-moss" : "border-line text-muted hover:border-ink hover:text-ink"}`}
          >
            <GitCompare className="size-4" />
          </button>
          <button
            onClick={() => add(product)}
            disabled={soldOut}
            aria-label={`Add ${product.name} to basket`}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-on-forest transition hover:rotate-90 hover:bg-clay hover:text-white disabled:opacity-40"
          >
            <Plus className="size-5" />
          </button>
          </div>
        </div>
      </div>

      {quick && <QuickView product={product} open={quick} onClose={() => setQuick(false)} />}
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse rounded-[24px] bg-surface-2" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
