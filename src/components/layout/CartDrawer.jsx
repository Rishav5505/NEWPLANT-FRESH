import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ShoppingBag, Trash2, Truck, Plus, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCatalog } from "../../context/CatalogContext";
import { Button, QtyStepper } from "../ui";
import { formatINR, hdImage, cartTotals, FREE_SHIPPING_THRESHOLD } from "../../lib/format";
import { fallbackImage } from "../../lib/catalog";

// Small add-ons (pots, care kits) that pair with what's in the basket.
function PairWith({ inCart }) {
  const { byCategory, loadCategory } = useCatalog();
  const { add } = useCart();
  useEffect(() => {
    loadCategory("planters").catch(() => {});
    loadCategory("care-kits").catch(() => {});
  }, [loadCategory]);
  const picks = useMemo(() => {
    const ids = new Set(inCart.map((i) => i.id));
    const pool = [...(byCategory.planters || []), ...(byCategory["care-kits"] || [])].filter((p) => p.image && p.price > 0 && p.price <= 799 && p.stock !== 0 && !ids.has(p.id));
    // Stable pseudo-random pick so the list doesn't reshuffle on every render
    return pool.sort((a, b) => String(a.id).slice(-3).localeCompare(String(b.id).slice(-3))).slice(0, 3);
  }, [byCategory, inCart]);
  if (picks.length === 0) return null;
  return (
    <div className="mt-6 rounded-3xl bg-surface p-4">
      <p className="mb-3 text-xs font-bold tracking-[0.2em] text-clay uppercase">Pair it with</p>
      <ul className="space-y-3">
        {picks.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <img src={hdImage(p.image, 120)} data-fallback={fallbackImage(p.category)} alt="" className="size-12 rounded-xl bg-surface-2 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted">{formatINR(p.price)}</p>
            </div>
            <button onClick={() => add(p)} className="grid size-9 shrink-0 place-items-center rounded-full border border-line hover:bg-forest hover:text-on-forest" aria-label={`Add ${p.name}`}>
              <Plus className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CartDrawer() {
  const { items, open, setOpen, update, remove } = useCart();
  const wishlist = useWishlist();
  const saveForLater = (it) => {
    if (!wishlist.has(it.id)) wishlist.toggle(it);
    remove(it.id);
  };
  const navigate = useNavigate();
  const { subtotal } = cartTotals(items);
  const left = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[75] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Your basket"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">Your basket</h2>
          <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close basket"><X className="size-5" /></button>
        </div>

        {items.length > 0 && (
          <div className="border-b border-line px-6 py-4">
            <p className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-moss" />
              {left > 0 ? <>You're <b>{formatINR(left)}</b> away from free delivery</> : <b>You've unlocked free delivery 🎉</b>}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-moss transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 grid size-20 place-items-center rounded-full bg-surface-2"><ShoppingBag className="size-8 text-moss" /></div>
              <p className="font-display text-2xl">Your basket is empty</p>
              <p className="mt-2 text-sm text-muted">Let's find a green friend for your space.</p>
              <Button className="mt-6" onClick={() => { setOpen(false); navigate("/shop"); }}>Browse plants</Button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4 py-4">
                  <Link to={`/product/${it.id}`} onClick={() => setOpen(false)} className="shrink-0">
                    <img data-fallback="/images/placeholder.svg" src={hdImage(it.image, 200)} alt="" className="size-24 rounded-2xl bg-surface-2 object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-sm font-semibold">{it.name}</p>
                    <p className="mt-1 text-sm text-muted">{formatINR(it.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtyStepper small value={it.quantity} onChange={(q) => update(it.id, q)} />
                      <div className="flex items-center">
                        <button onClick={() => saveForLater(it)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-clay" aria-label={`Save ${it.name} for later`} title="Save for later">
                          <Heart className="size-4" />
                        </button>
                        <button onClick={() => remove(it.id)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-clay" aria-label={`Remove ${it.name}`} title="Remove">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && <PairWith inCart={items} />}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-2xl">{formatINR(subtotal)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => { setOpen(false); navigate("/checkout"); }}>Checkout securely</Button>
            <p className="mt-3 text-center text-xs text-muted">Taxes, discounts and delivery calculated at checkout</p>
          </div>
        )}
      </aside>
    </div>
  );
}
