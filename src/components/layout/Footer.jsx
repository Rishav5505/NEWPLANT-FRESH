import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Youtube, Facebook, Mail } from "lucide-react";
import Logo from "./Logo";
import { CATEGORIES } from "../../lib/catalog";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast("Please enter a valid email", "error");
    setBusy(true);
    try {
      const d = await api("/api/newsletter", { method: "POST", body: { email } });
      toast(d.message || "Welcome to the JeevaLeaf circle 🌿");
      setEmail("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="relative mt-24 overflow-hidden bg-[#0f2116] text-[#e9e4d6]">
      <img src="/images/hd/texture-fern.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-[0.07]" />
      <div className="relative container-x pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <h3 className="mt-8 max-w-sm font-display text-4xl leading-tight font-light">
              Letters from the <em className="text-[#e07a52]">greenhouse.</em>
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#e9e4d6]/70">
              Seasonal care notes, new arrivals and members-only offers. One email a fortnight, no spam.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex max-w-sm items-center rounded-full border border-white/20 bg-white/5 p-1.5 focus-within:border-white/50">
              <Mail className="ml-3 size-4 opacity-60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
              />
              <button disabled={busy} className="grid size-10 place-items-center rounded-full bg-[#e07a52] text-white transition hover:brightness-110 disabled:opacity-50" aria-label="Subscribe">
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol title="Shop">
              {CATEGORIES.map((c) => <FLink key={c.slug} to={`/shop/${c.slug}`}>{c.title}</FLink>)}
            </FooterCol>
            <FooterCol title="Discover">
              <FLink to="/">Home</FLink>
              <FLink to="/studio">3D Pot Studio</FLink>
              <FLink to="/plant-finder">Plant Finder quiz</FLink>
              <FLink to="/care">Care Library</FLink>
              <FLink to="/garden">My Garden reminders</FLink>
              <FLink to="/about">Our story</FLink>
            </FooterCol>
            <FooterCol title="Help">
              <FLink to="/track">Track your order</FLink>
              <FLink to="/contact">Contact us</FLink>
              <FLink to="/terms">Terms of service</FLink>
              <FLink to="/privacy">Privacy policy</FLink>
            </FooterCol>
          </div>
        </div>

        <p className="pointer-events-none mt-20 font-display text-[18vw] leading-[0.8] font-light tracking-tighter text-white/[0.06] select-none lg:text-[14rem]">
          JeevaLeaf
        </p>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} JeevaLeaf. Grown with care in India.</p>
          <div className="flex gap-2">
            {[Instagram, Youtube, Facebook].map((I, i) => (
              <span key={i} className="grid size-9 place-items-center rounded-full border border-white/15"><I className="size-4" /></span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#e07a52] uppercase">{title}</p>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-[#e9e4d6]/75 transition hover:text-white">{children}</Link>
    </li>
  );
}
