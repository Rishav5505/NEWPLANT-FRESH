import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Truck, Gift, Tag, Loader2, Banknote, Smartphone, CreditCard, Landmark, ShoppingBag, X, Check, Wallet } from "lucide-react";
import { Button, EmptyState } from "../components/ui";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { cartTotals, formatINR, hdImage, GIFT_WRAP_FEE } from "../lib/format";

const METHODS = [
  { v: "cod", l: "Cash on delivery", d: "Pay when your plants arrive", icon: Banknote },
  { v: "upi", l: "UPI", d: "GPay, PhonePe, Paytm", icon: Smartphone },
  { v: "card", l: "Card", d: "Credit or debit", icon: CreditCard },
  { v: "netbanking", l: "Netbanking", d: "All major banks", icon: Landmark },
];

// Next 6 delivery days, starting 2 days from today (local date strings, not UTC).
const pad2 = (n) => String(n).padStart(2, "0");
const DATES = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + 2 + i);
  return {
    value: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
    label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  };
});
const SLOTS = [
  { v: "morning", l: "Morning", h: "9 am – 12 pm" },
  { v: "afternoon", l: "Afternoon", h: "12 – 4 pm" },
  { v: "evening", l: "Evening", h: "4 – 8 pm" },
];

function SlotChip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`min-w-24 shrink-0 rounded-2xl border-2 px-3 py-2.5 text-center text-sm transition ${active ? "border-forest bg-surface" : "border-line hover:border-ink/40"}`}>
      {children}
    </button>
  );
}

export default function Checkout() {
  const { items, clear } = useCart();
  const { user, openAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", pincode: "" });
  const [method, setMethod] = useState("cod");
  const [gift, setGift] = useState({ on: false, message: "", wrap: false });
  const [coupon, setCoupon] = useState({ input: "", applied: null, busy: false });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Prefill from the signed-in profile
  useEffect(() => {
    if (!user) return;
    const addr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    setForm((f) => ({
      name: f.name || addr?.fullName || user.name || "",
      phone: f.phone || addr?.phone || user.phone || "",
      email: f.email || user.email || "",
      address: f.address || [addr?.addressLine1, addr?.addressLine2].filter(Boolean).join(", "),
      city: f.city || [addr?.city, addr?.state].filter(Boolean).join(", "),
      pincode: f.pincode || addr?.pincode || "",
    }));
  }, [user]);

  const [useWallet, setUseWallet] = useState(false);
  const [slot, setSlot] = useState({ date: "", time: "" });
  const totals = cartTotals(items, coupon.applied?.discount || 0, gift.on && gift.wrap);
  const walletBalance = Number(user?.walletBalance) || 0;
  const walletUsed = useWallet ? Math.min(walletBalance, totals.total) : 0;
  const payable = totals.total - walletUsed;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Re-validate the coupon when the basket changes
  const subtotal = totals.subtotal;
  const appliedCode = coupon.applied?.code;
  useEffect(() => {
    if (!appliedCode || subtotal === 0) return;
    api("/api/coupons/validate", { method: "POST", body: { code: appliedCode, subtotal } })
      .then((d) => setCoupon((c) => ({ ...c, applied: { code: d.code, discount: d.discount, description: d.description } })))
      .catch(() => setCoupon((c) => ({ ...c, applied: null })));
  }, [subtotal, appliedCode]);

  const applyCoupon = async () => {
    if (!coupon.input.trim()) return;
    setCoupon((c) => ({ ...c, busy: true }));
    try {
      const d = await api("/api/coupons/validate", { method: "POST", body: { code: coupon.input.trim(), subtotal: totals.subtotal } });
      setCoupon({ input: "", applied: { code: d.code, discount: d.discount, description: d.description }, busy: false });
      toast(`Coupon ${d.code} applied — you save ${formatINR(d.discount)}`);
    } catch (e) {
      setCoupon((c) => ({ ...c, busy: false }));
      toast(e.message, "error");
    }
  };

  const place = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return openAuth("login");
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return setError("Please enter a valid 10-digit mobile number");
    if (!/^\d{6}$/.test(form.pincode)) return setError("Please enter a valid 6-digit pincode");
    setPlacing(true);
    try {
      const d = await api("/api/orders", {
        method: "POST",
        auth: true,
        body: {
          items: items.map((it) => ({ productId: it.id, name: it.name, price: it.price, quantity: it.quantity, image: it.image, currency: "INR" })),
          paymentMethod: method,
          couponCode: coupon.applied?.code,
          useWallet: walletUsed > 0,
          giftMessage: gift.on ? gift.message.trim() : "",
          giftWrap: gift.on && gift.wrap,
          preferredDate: slot.date || undefined,
          preferredSlot: slot.date ? slot.time : undefined,
          deliveryName: form.name,
          deliveryPhone: form.phone,
          deliveryEmail: form.email,
          deliveryAddress: `${form.address}, ${form.pincode}`,
          deliveryLocation: form.city,
        },
      });
      const id = d.orderId || d.order?._id;
      clear();
      const paidInFull = d.order?.paymentStatus === "paid";
      navigate(method === "cod" || paidInFull ? `/order-success/${id}` : `/payment/${id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-24">
        <EmptyState icon={ShoppingBag} title="Nothing to check out yet" text="Your basket is empty. Add a few green friends first." action={<Button to="/shop">Browse plants</Button>} />
      </div>
    );
  }

  return (
    <section className="container-x py-10 md:py-14">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-5xl font-light md:text-6xl">Checkout</h1>
        <p className="hidden items-center gap-2 text-sm text-muted sm:flex"><Lock className="size-4" /> Secure checkout</p>
      </div>

      {!user && (
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-surface p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Sign in to place your order</p>
            <p className="text-sm text-muted">Track deliveries, get care reminders and save your address for next time.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openAuth("signup")}>Create account</Button>
            <Button size="sm" onClick={() => openAuth("login")}>Sign in</Button>
          </div>
        </div>
      )}

      <form onSubmit={place} className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-10">
          <Step n="01" title="Delivery details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><input required value={form.name} onChange={set("name")} className="field" autoComplete="name" /></Field>
              <Field label="Mobile number"><input required inputMode="tel" value={form.phone} onChange={set("phone")} className="field" autoComplete="tel" placeholder="98765 43210" /></Field>
              <Field label="Email" className="sm:col-span-2"><input required type="email" value={form.email} onChange={set("email")} className="field" autoComplete="email" /></Field>
              <Field label="House, street, area" className="sm:col-span-2"><input required value={form.address} onChange={set("address")} className="field" autoComplete="street-address" /></Field>
              <Field label="City & state"><input required value={form.city} onChange={set("city")} className="field" autoComplete="address-level2" /></Field>
              <Field label="Pincode"><input required inputMode="numeric" maxLength={6} value={form.pincode} onChange={set("pincode")} className="field" autoComplete="postal-code" /></Field>
            </div>
          </Step>

          <Step n="02" title="Make it a gift">
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-line p-4">
              <Gift className="size-5 text-clay" />
              <span className="flex-1"><b className="block text-sm">Send as a gift</b><span className="text-xs text-muted">We'll hide prices and add a handwritten-style card</span></span>
              <input type="checkbox" checked={gift.on} onChange={(e) => setGift((g) => ({ ...g, on: e.target.checked }))} className="size-5 accent-[var(--clay)]" />
            </label>
            {gift.on && (
              <>
              <label className="mt-3 flex cursor-pointer items-center gap-4 rounded-2xl border border-line p-4">
                <span className="text-xl" aria-hidden="true">🎀</span>
                <span className="flex-1"><b className="block text-sm">Add gift wrap · {formatINR(GIFT_WRAP_FEE)}</b><span className="text-xs text-muted">Kraft paper, twine and a sprig of dried flowers</span></span>
                <input type="checkbox" checked={gift.wrap} onChange={(e) => setGift((g) => ({ ...g, wrap: e.target.checked }))} className="size-5 accent-[var(--clay)]" />
              </label>
              <textarea value={gift.message} onChange={(e) => setGift((g) => ({ ...g, message: e.target.value.slice(0, 200) }))} rows={3} placeholder="Happy housewarming! May this little one grow as fast as your new memories…" className="field mt-3" />
              </>
            )}
          </Step>

          <Step n="03" title="Delivery slot">
            <p className="mb-3 text-sm text-muted">Optional — pick a day and time that suits you. We'll do our best to match it.</p>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <SlotChip active={!slot.date} onClick={() => setSlot({ date: "", time: "" })}>
                <span className="block text-xs text-muted">Any day</span>
                <span className="block font-semibold">Earliest</span>
              </SlotChip>
              {DATES.map((d) => (
                <SlotChip key={d.value} active={slot.date === d.value} onClick={() => setSlot((s) => ({ date: d.value, time: s.time || "morning" }))}>
                  <span className="block text-xs text-muted">{d.weekday}</span>
                  <span className="block font-semibold">{d.label}</span>
                </SlotChip>
              ))}
            </div>
            {slot.date && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {SLOTS.map((t) => (
                  <SlotChip key={t.v} active={slot.time === t.v} onClick={() => setSlot((s) => ({ ...s, time: t.v }))}>
                    <span className="block font-semibold">{t.l}</span>
                    <span className="block text-xs text-muted">{t.h}</span>
                  </SlotChip>
                ))}
              </div>
            )}
          </Step>

          <Step n="04" title="Payment">
            <div className="grid gap-3 sm:grid-cols-2">
              {METHODS.map(({ v, l, d, icon: Icon }) => (
                <label key={v} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${method === v ? "border-forest bg-surface" : "border-line hover:border-ink/40"}`}>
                  <input type="radio" name="pm" value={v} checked={method === v} onChange={() => setMethod(v)} className="sr-only" />
                  <Icon className="size-5 text-moss" />
                  <span className="flex-1"><b className="block text-sm">{l}</b><span className="text-xs text-muted">{d}</span></span>
                  {method === v && <Check className="size-5 text-forest" />}
                </label>
              ))}
            </div>
          </Step>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[32px] bg-surface p-6 md:p-8">
            <h2 className="font-display text-2xl">Order summary</h2>
            <ul className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4">
                  <div className="relative">
                    <img data-fallback="/images/placeholder.svg" src={hdImage(it.image, 160)} alt="" className="size-16 rounded-2xl bg-surface-2 object-cover" />
                    <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-forest text-xs font-bold text-on-forest">{it.quantity}</span>
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm">{it.name}</p>
                  <p className="text-sm font-semibold">{formatINR(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line pt-6">
              {coupon.applied ? (
                <div className="flex items-center justify-between rounded-2xl bg-moss/10 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-moss"><Tag className="size-4" /> {coupon.applied.code}</span>
                  <button type="button" onClick={() => setCoupon({ input: "", applied: null, busy: false })} className="text-muted hover:text-clay" aria-label="Remove coupon"><X className="size-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={coupon.input} onChange={(e) => setCoupon((c) => ({ ...c, input: e.target.value.toUpperCase() }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }} placeholder="Coupon code" className="field flex-1 text-sm uppercase" aria-label="Coupon code" />
                  <Button type="button" variant="outline" onClick={applyCoupon} disabled={coupon.busy}>{coupon.busy ? <Loader2 className="size-4 animate-spin" /> : "Apply"}</Button>
                </div>
              )}
              <p className="mt-2 text-xs text-muted">First order? Try <button type="button" onClick={() => setCoupon((c) => ({ ...c, input: "WELCOME10" }))} className="font-semibold text-clay">WELCOME10</button></p>
            </div>

            <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              <Row l="Subtotal" v={formatINR(totals.subtotal)} />
              {totals.discount > 0 && <Row l="Discount" v={`−${formatINR(totals.discount)}`} accent />}
              <Row l="GST (5%)" v={formatINR(totals.tax)} />
              {totals.giftWrap > 0 && <Row l="Gift wrap" v={formatINR(totals.giftWrap)} />}
              <Row l={<span className="inline-flex items-center gap-1.5"><Truck className="size-4" /> Delivery</span>} v={totals.shipping === 0 ? "Free" : formatINR(totals.shipping)} />
              {walletUsed > 0 && <Row l="Wallet credits" v={`−${formatINR(walletUsed)}`} accent />}
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-3xl">{formatINR(payable)}</dd>
              </div>
            </dl>

            {walletBalance > 0 && (
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-bg p-4 text-sm">
                <Wallet className="size-5 text-moss" />
                <span className="flex-1">Use wallet credits <span className="text-muted">({formatINR(walletBalance)} available)</span></span>
                <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="size-5 accent-[var(--moss)]" />
              </label>
            )}

            {error && <p className="mt-4 rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={placing}>
              {placing && <Loader2 className="size-4 animate-spin" />}
              {method === "cod" || payable === 0 ? `Place order · ${formatINR(payable)}` : `Continue to payment · ${formatINR(payable)}`}
            </Button>
            <p className="mt-4 text-center text-xs text-muted">By placing your order you agree to our <Link to="/terms" className="underline">terms</Link>.</p>
          </div>
        </aside>
      </form>
    </section>
  );
}

function Step({ n, title, children }) {
  return (
    <div>
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-display text-clay italic">{n}</span>
        <h2 className="text-2xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Row({ l, v, accent }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{l}</dt>
      <dd className={accent ? "font-semibold text-moss" : ""}>{v}</dd>
    </div>
  );
}
