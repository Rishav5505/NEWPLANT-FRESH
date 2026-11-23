import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, Loader2, Check } from "lucide-react";
import { Button } from "../components/ui";
import { api } from "../lib/api";
import { formatINR, formatDate, hdImage } from "../lib/format";
import { useAuth } from "../context/AuthContext";

const STEPS = ["pending", "processing", "shipped", "delivered"];
const LABEL = { pending: "Order placed", processing: "Being packed", shipped: "On the way", delivered: "Delivered", cancelled: "Cancelled" };

// Guest-friendly order tracking with order number + email.
export default function Track() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [form, setForm] = useState({ order: params.get("order") || "", email: params.get("email") || user?.email || "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const d = await api(`/api/track?order=${encodeURIComponent(form.order.trim())}&email=${encodeURIComponent(form.email.trim())}`);
      setOrder(d.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const status = (order?.status || "").toLowerCase();
  const stepIdx = STEPS.indexOf(status);
  const when = (s) => order?.statusHistory?.find((h) => h.status === s)?.at;

  return (
    <section className="container-x grid gap-12 py-12 md:py-20 lg:grid-cols-[1fr_1.2fr]">
      <div className="animate-fade-up">
        <p className="eyebrow mb-5">Track an order</p>
        <h1 className="text-5xl leading-[0.95] font-light md:text-7xl">Where are my <em className="text-clay">plants?</em></h1>
        <p className="mt-6 max-w-md text-lg text-muted">Enter the order number from your confirmation email (e.g. <b>#A1B2C3D4</b>) and the email you ordered with.</p>
        <form onSubmit={submit} className="mt-10 max-w-md space-y-4">
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Order number</span><input required value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} className="field uppercase" placeholder="#A1B2C3D4" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Email</span><input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="field" autoComplete="email" /></label>
          {error && <p className="rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <PackageSearch className="size-4" />} Track order</Button>
        </form>
      </div>

      <div className="rounded-[36px] bg-surface p-6 sm:p-10">
        {!order ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center text-center text-muted">
            <img src="/images/hd/cat-planters.jpg" alt="" className="mb-6 h-40 w-32 object-cover arch" />
            <p>Your order's journey will appear here.</p>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-3xl">#{order.number}</h2>
              <p className="text-sm text-muted">Placed {formatDate(order.createdAt)} · {formatINR(order.total)}</p>
            </div>
            {status === "cancelled" ? (
              <p className="mt-6 rounded-2xl bg-clay/10 p-4 font-semibold text-clay">This order was cancelled.</p>
            ) : (
              <ol className="mt-8 space-y-0">
                {STEPS.map((s, i) => {
                  const done = i <= stepIdx;
                  return (
                    <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
                      {i < STEPS.length - 1 && <span className={`absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5 ${i < stepIdx ? "bg-moss" : "bg-line"}`} />}
                      <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 ${done ? "border-moss bg-moss text-white" : "border-line bg-bg"}`}>
                        {done && <Check className="size-4" />}
                      </span>
                      <div className="pt-1">
                        <p className={`font-semibold ${done ? "" : "text-muted"}`}>{LABEL[s]}</p>
                        {when(s) && <p className="text-xs text-muted">{formatDate(when(s))}</p>}
                        {i === stepIdx && status !== "delivered" && <p className="mt-1 text-sm text-moss">Current stage</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            <ul className="mt-8 space-y-3 border-t border-line pt-6">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <img src={it.image ? hdImage(it.image, 120) : "/images/placeholder.svg"} data-fallback="/images/placeholder.svg" alt="" className="size-12 rounded-xl object-cover" />
                  <span className="flex-1">{it.name}</span>
                  <span className="text-muted">× {it.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
