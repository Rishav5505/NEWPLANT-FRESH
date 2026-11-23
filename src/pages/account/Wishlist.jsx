import { Heart, ShoppingBag, Share2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import AccountLayout from "./AccountLayout";
import ProductCard from "../../components/ProductCard";
import { Button, EmptyState } from "../../components/ui";
import { useWishlist } from "../../context/WishlistContext";

export default function Wishlist() {
  const { items } = useWishlist();
  const { addMany } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const share = async () => {
    const ids = items.map((p) => p.id).filter((id) => /^[a-f0-9]{24}$/i.test(id)).slice(0, 40);
    const url = `${window.location.origin}/wishlist/shared?ids=${ids.join(",")}${user?.name ? `&from=${encodeURIComponent(user.name.split(" ")[0])}` : ""}`;
    try {
      if (navigator.share) await navigator.share({ title: "My JeevaLeaf wishlist", text: "Plants I'd love 🌿", url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Wishlist link copied — send it to friends & family", "info");
      }
    } catch {
      /* share cancelled */
    }
  };
  return (
    <AccountLayout title="Wishlist" guestOk>
      {items.length === 0 ? (
        <EmptyState icon={Heart} title="Nothing saved yet" text="Tap the heart on any plant to keep it here for later." action={<Button to="/shop">Discover plants</Button>} />
      ) : (
        <>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface p-5">
          <p className="text-sm text-muted">{items.length} saved item{items.length === 1 ? "" : "s"}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={share}><Share2 className="size-4" /> Share list</Button>
            <Button size="sm" onClick={() => addMany(items)}><ShoppingBag className="size-4" /> Move all to basket</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        </>
      )}
    </AccountLayout>
  );
}
