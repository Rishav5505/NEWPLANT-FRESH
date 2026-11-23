import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Search, Heart, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

// App-style bottom navigation on phones, so Home/Shop/Search are always one tap away.
export default function MobileTabBar({ onSearch }) {
  const { pathname } = useLocation();
  const { user, openAuth } = useAuth();
  const { items } = useWishlist();
  if (/^\/(checkout|payment|admin)/.test(pathname)) return null;

  const cls = ({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${isActive ? "text-clay" : "text-muted"}`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Quick navigation">
      <div className="flex">
        <NavLink to="/" end className={cls}><Home className="size-5" />Home</NavLink>
        <NavLink to="/shop" className={cls}><LayoutGrid className="size-5" />Shop</NavLink>
        <button onClick={onSearch} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted"><Search className="size-5" />Search</button>
        <NavLink to="/account/wishlist" className={cls}>
          <span className="relative">
            <Heart className="size-5" />
            {items.length > 0 && <span className="absolute -top-1 -right-2 grid size-4 place-items-center rounded-full bg-clay text-[9px] text-white">{items.length > 9 ? "9+" : items.length}</span>}
          </span>
          Wishlist
        </NavLink>
        {user ? (
          <NavLink to="/account" className={cls}><User className="size-5" />Account</NavLink>
        ) : (
          <button onClick={() => openAuth("login")} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted"><User className="size-5" />Sign in</button>
        )}
      </div>
    </nav>
  );
}
