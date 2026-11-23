import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Droplets, ArrowRight } from "lucide-react";
import { Modal, Button, QtyStepper } from "./ui";
import { useCart } from "../context/CartContext";
import { formatINR, hdImage, discountPct, plainText } from "../lib/format";
import { careHints, fallbackImage, categoryBySlug } from "../lib/catalog";

// Peek at a product without leaving the grid.
export default function QuickView({ product, open, onClose }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  if (!product) return null;
  const off = discountPct(product.price, product.oldPrice);
  const care = careHints(product.name);
  const cat = categoryBySlug(product.category);
  const soldOut = product.stock === 0;
  const text = plainText(product.description);

  return (
    <Modal open={open} onClose={onClose} title={product.name} wide>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-surface-2">
          <img src={hdImage(product.image, 900)} data-fallback={fallbackImage(product.category)} alt={product.name} className="size-full object-cover" />
          {off > 0 && <span className="absolute top-4 left-4 rounded-full bg-clay px-3 py-1 text-xs font-bold text-white">Save {off}%</span>}
        </div>
        <div className="flex flex-col">
          {cat && <p className="font-display text-sm text-clay italic">{cat.latin}</p>}
          <h2 className="mt-1 pr-8 text-3xl leading-tight">{product.name}</h2>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatINR(product.price)}</span>
            {off > 0 && <span className="text-muted line-through">{formatINR(product.oldPrice)}</span>}
          </div>
          {care && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5"><Sun className="size-4 text-moss" />{care.light}</span>
              <span className="inline-flex items-center gap-1.5"><Droplets className="size-4 text-moss" />{care.water}</span>
            </div>
          )}
          {text && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted">{text}</p>}
          <div className="mt-auto pt-6">
            <div className="flex items-center gap-3">
              <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, Math.min(20, q)))} />
              <Button className="flex-1" disabled={soldOut} onClick={() => { add(product, qty); onClose(); }}>
                {soldOut ? "Sold out" : `Add · ${formatINR(product.price * qty)}`}
              </Button>
            </div>
            <Link to={`/product/${product.id}`} onClick={onClose} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-clay">
              Full details & reviews <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
