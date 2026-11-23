import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Gift, Heart, ShoppingBag } from "lucide-react";
import ProductCard, { ProductGridSkeleton } from "../components/ProductCard";
import { Button, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import { toProduct } from "../lib/catalog";
import { useCart } from "../context/CartContext";

// Someone shared their wishlist: show the plants so friends can gift them.
export default function SharedWishlist() {
  const [params] = useSearchParams();
  const ids = (params.get("ids") || "").split(",").filter((x) => /^[a-f0-9]{24}$/i.test(x)).slice(0, 40);
  const from = (params.get("from") || "").replace(/[^\p{L} .'-]/gu, "").slice(0, 30);
  const [items, setItems] = useState(null);
  const { addMany } = useCart();
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    Promise.allSettled(key.split(",").map((id) => api(`/api/plants/detail/${id}`))).then((res) =>
      setItems(res.filter((r) => r.status === "fulfilled").map((r) => toProduct(r.value.plant)))
    );
  }, [key]);

  return (
    <section className="container-x py-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2"><Gift className="size-4" /> A shared wishlist</p>
          <h1 className="text-5xl leading-[0.95] font-light md:text-6xl">{from ? <>{from}'s <em className="text-clay">plant wishlist</em></> : <>A <em className="text-clay">plant wishlist</em> for you</>}</h1>
          <p className="mt-4 max-w-lg text-muted">Looking for the perfect gift? These are the plants they're dreaming of. Add a gift message and wrap at checkout.</p>
        </div>
        {items?.length > 0 && <Button onClick={() => addMany(items.filter((p) => p.stock !== 0))}><ShoppingBag className="size-4" /> Add all to basket</Button>}
      </div>
      {!key ? (
        <EmptyState icon={Heart} title="This link is empty" text="Ask your friend to share their wishlist again." action={<Button to="/shop">Browse plants</Button>} />
      ) : !items ? (
        <ProductGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState icon={Heart} title="These plants have moved on" text="The products in this list are no longer available." action={<Button to="/shop">Browse plants</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
