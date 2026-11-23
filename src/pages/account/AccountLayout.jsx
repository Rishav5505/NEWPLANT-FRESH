import { NavLink } from "react-router-dom";
import { User, Package, Heart, Wallet, Sprout, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui";

const LINKS = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/wallet", label: "Wallet", icon: Wallet },
  { to: "/garden", label: "My Garden", icon: Sprout },
];

export default function AccountLayout({ title, children, guestOk = false }) {
  const { user, openAuth } = useAuth();

  if (!user && !guestOk) {
    return (
      <section className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-surface-2 text-moss"><LogIn className="size-7" /></div>
          <h1 className="mt-6 text-4xl">Sign in to continue</h1>
          <p className="mt-2 text-muted">Your orders, wishlist and garden live in your account.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => openAuth("login")}>Sign in</Button>
            <Button variant="outline" onClick={() => openAuth("signup")}>Create account</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-x py-10 md:py-14">
      <p className="eyebrow mb-3">My account</p>
      <h1 className="text-5xl font-light md:text-6xl">{title}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition lg:rounded-2xl ${isActive ? "bg-forest text-on-forest" : "hover:bg-surface-2"}`}>
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
