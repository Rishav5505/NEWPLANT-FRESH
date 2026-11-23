import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, Moon, Sun, ChevronDown, Sparkles, LogOut, Package, Wallet, Shield, Sprout, Home } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORIES } from "../../lib/catalog";

const NAV = [
  { to: "/studio", label: "3D Studio" },
  { to: "/plant-finder", label: "Plant Finder" },
  { to: "/care", label: "Care Library" },
  { to: "/garden", label: "My Garden" },
  { to: "/about", label: "Our Story" },
];

const ANNOUNCEMENTS = [
  "Free delivery on orders above ₹999",
  "New here? Use WELCOME10 for 10% off your first order",
  "Healthy-plant guarantee · report issues within 48 hours",
  "Refer a friend: they get ₹100 off, you get ₹100 credit",
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ANNOUNCEMENTS.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-8 overflow-hidden bg-forest text-xs font-medium tracking-wide text-on-forest" aria-live="polite">
      {ANNOUNCEMENTS.map((a, n) => (
        <p key={a} className={`absolute inset-0 grid place-items-center px-4 text-center transition-all duration-500 ${n === i ? "translate-y-0 opacity-100" : n === (i + ANNOUNCEMENTS.length - 1) % ANNOUNCEMENTS.length ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"}`} aria-hidden={n !== i}>
          {a}
        </p>
      ))}
    </div>
  );
}

export default function Header({ onSearch }) {
  const { count, setOpen } = useCart();
  const { user, openAuth, logout, isAdmin } = useAuth();
  const { items: wish } = useWishlist();
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus whenever the route changes (adjusting state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobile(false);
    setShopOpen(false);
    setUserOpen(false);
  }

  const linkCls = ({ isActive }) => `relative py-2 text-[0.92rem] font-medium transition-colors hover:text-clay ${isActive ? "text-clay" : "text-ink"}`;

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "bg-bg"}`}>
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="grid size-10 place-items-center rounded-full hover:bg-ink/5 md:hidden" onClick={() => setMobile(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-5 md:flex lg:gap-8" aria-label="Main">
            <NavLink to="/" end className={linkCls}>Home</NavLink>
            <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
              <NavLink to="/shop" className={linkCls}>
                <span className="inline-flex items-center gap-1">Shop <ChevronDown className="size-3.5" /></span>
              </NavLink>
              {shopOpen && (
                <div className="absolute top-full left-1/2 w-[640px] -translate-x-1/2 pt-4">
                  <div className="animate-fade-up grid grid-cols-[1fr_1fr_200px] gap-2 rounded-[28px] border border-line bg-surface p-4 shadow-2xl">
                    {CATEGORIES.map((c) => (
                      <Link key={c.slug} to={`/shop/${c.slug}`} className="group flex items-center gap-3 rounded-2xl p-2 hover:bg-surface-2">
                        <img src={c.image} alt="" className="size-12 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-semibold">{c.title}</p>
                          <p className="font-display text-xs text-muted italic">{c.latin}</p>
                        </div>
                      </Link>
                    ))}
                    <Link to="/shop" className="flex items-center gap-3 rounded-2xl p-2 hover:bg-surface-2">
                      <div className="grid size-12 place-items-center rounded-xl bg-forest text-on-forest"><Sprout className="size-5" /></div>
                      <p className="text-sm font-semibold">Shop everything</p>
                    </Link>
                    <Link to="/plant-finder" className="relative col-start-3 row-span-3 row-start-1 overflow-hidden rounded-2xl">
                      <img src="/images/hd/boho.jpg" alt="" className="absolute inset-0 size-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 p-4 text-white">
                        <Sparkles className="mb-2 size-5" />
                        <p className="font-display text-lg leading-tight">Not sure what to pick?</p>
                        <p className="mt-1 text-xs opacity-80">Take the 30-second plant quiz →</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {NAV.map((n, i) => (
              <NavLink key={n.to} to={n.to} className={(s) => `${linkCls(s)} ${i >= 3 ? "hidden xl:inline" : ""}`}>{n.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <IconBtn onClick={onSearch} label="Search" className="hidden md:grid"><Search className="size-[19px]" /></IconBtn>
            <IconBtn onClick={toggle} label={dark ? "Switch to light mode" : "Switch to dark mode"} className="hidden sm:grid">
              {dark ? <Sun className="size-[19px]" /> : <Moon className="size-[19px]" />}
            </IconBtn>
            <Link to="/account/wishlist" className="relative hidden size-10 place-items-center rounded-full hover:bg-ink/5 sm:grid" aria-label="Wishlist">
              <Heart className="size-[19px]" />
              {wish.length > 0 && <Badge n={wish.length} />}
            </Link>

            <div className="relative">
              {user ? (
                <button onClick={() => setUserOpen((o) => !o)} className="ml-1 grid size-9 place-items-center overflow-hidden rounded-full bg-sage text-sm font-bold text-forest" aria-label="Account menu" aria-expanded={userOpen}>
                  {user.profilePhoto ? <img src={user.profilePhoto} alt="" className="size-full object-cover" /> : user.name?.[0]?.toUpperCase()}
                </button>
              ) : (
                <IconBtn onClick={() => openAuth("login")} label="Sign in" className="hidden md:grid"><User className="size-[19px]" /></IconBtn>
              )}
              {userOpen && user && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                  <div className="animate-fade-up absolute right-0 z-20 mt-3 w-64 overflow-hidden rounded-3xl border border-line bg-surface p-2 shadow-2xl">
                    <div className="px-3 py-3">
                      <p className="font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <MenuLink to="/account" icon={User}>My profile</MenuLink>
                    <MenuLink to="/account/orders" icon={Package}>Orders & tracking</MenuLink>
                    <MenuLink to="/garden" icon={Sprout}>My Garden</MenuLink>
                    <MenuLink to="/account/wishlist" icon={Heart}>Wishlist</MenuLink>
                    <MenuLink to="/account/wallet" icon={Wallet}>Wallet</MenuLink>
                    {isAdmin && <MenuLink to="/admin" icon={Shield}>Admin dashboard</MenuLink>}
                    <button onClick={() => { logout(); setUserOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-clay hover:bg-surface-2">
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setOpen(true)} className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-full bg-forest pr-4 pl-3 text-sm font-semibold text-on-forest transition hover:bg-moss" aria-label={`Basket, ${count} items`}>
              <ShoppingBag className="size-[18px]" />
              <span className="tabular-nums">{count}</span>
            </button>
          </div>
        </div>
      </header>

      {mobile && <MobileNav onClose={() => setMobile(false)} dark={dark} toggle={toggle} />}
    </>
  );
}

function IconBtn({ children, label, className = "", ...rest }) {
  return (
    <button className={`grid size-10 place-items-center rounded-full transition hover:bg-ink/5 ${className}`} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

function Badge({ n }) {
  return <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-clay text-[10px] font-bold text-white">{n > 9 ? "9+" : n}</span>;
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm hover:bg-surface-2">
      <Icon className="size-4 text-moss" /> {children}
    </Link>
  );
}

function MobileNav({ onClose, dark, toggle }) {
  return (
    <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-up absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-bg p-6">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close menu"><X className="size-5" /></button>
        </div>
        <Link to="/" className="mb-6 flex items-center justify-between rounded-2xl bg-surface px-4 py-4 font-display text-2xl">
          Home <Home className="size-5 text-moss" />
        </Link>
        <p className="eyebrow mb-3">Shop</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/shop/${c.slug}`} className="relative h-24 overflow-hidden rounded-2xl">
              <img src={c.image} alt="" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-black/35" />
              <span className="absolute bottom-2 left-3 text-sm font-semibold text-white">{c.title}</span>
            </Link>
          ))}
          <Link to="/shop" className="grid h-24 place-items-center rounded-2xl bg-forest text-sm font-semibold text-on-forest">Shop all →</Link>
        </div>
        <nav className="mt-8 flex flex-col">
          {[...NAV, { to: "/contact", label: "Contact" }, { to: "/track", label: "Track order" }].map((n) => (
            <Link key={n.to} to={n.to} className="border-b border-line py-4 font-display text-2xl">{n.label}</Link>
          ))}
        </nav>
        <button onClick={toggle} className="mt-8 inline-flex items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-sm">
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />} {dark ? "Day garden" : "Night garden"}
        </button>
      </div>
    </div>
  );
}
