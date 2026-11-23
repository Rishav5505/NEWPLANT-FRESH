import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Package, Leaf, Tag, MessageSquare, Users, Mail, RefreshCw, Search, Loader2, IndianRupee,
  ShoppingBag, TrendingUp, AlertTriangle, Download, Trash2, Check, Plus, X, Gift, Eye, HelpCircle, Home,
} from "lucide-react";
import { Button, Modal, EmptyState } from "../../components/ui";
import { api } from "../../lib/api";
import { formatINR, formatDate, hdImage } from "../../lib/format";
import { CATEGORIES, categoryBySlug, fallbackImage } from "../../lib/catalog";
import { useCatalog } from "../../context/CatalogContext";
import { useToast } from "../../context/ToastContext";
import { generateInvoicePDF } from "../../utils/invoiceUtils";

const TABS = [
  { k: "overview", l: "Overview", icon: LayoutDashboard },
  { k: "orders", l: "Orders", icon: Package },
  { k: "products", l: "Products & stock", icon: Leaf },
  { k: "coupons", l: "Coupons", icon: Tag },
  { k: "messages", l: "Messages", icon: MessageSquare },
  { k: "questions", l: "Product Q&A", icon: HelpCircle },
  { k: "customers", l: "Customers", icon: Users },
  { k: "subscribers", l: "Newsletter", icon: Mail },
];
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_STYLE = {
  pending: "bg-surface-2 text-ink",
  processing: "bg-sage/40 text-forest",
  shipped: "bg-[#e9dfc6] text-[#6b4a1d]",
  delivered: "bg-moss/15 text-moss",
  cancelled: "bg-clay/10 text-clay",
};
const short = (id) => "#" + String(id).slice(-8).toUpperCase();

async function fetchAdminData() {
  const [o, u, m] = await Promise.all([api("/api/admin/orders", { auth: true }), api("/api/admin/users", { auth: true }), api("/api/admin/messages", { auth: true })]);
  return { orders: o.orders || [], users: u.users || [], messages: m.messages || [] };
}

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.k === params.get("tab")) ? params.get("tab") : "overview";
  const [data, setData] = useState({ orders: null, users: null, messages: null });
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      fetchAdminData().then(
        (d) => { setError(""); setData(d); },
        (e) => setError(e.message)
      ),
    []
  );

  useEffect(() => {
    let alive = true;
    fetchAdminData().then(
      (d) => alive && setData(d),
      (e) => alive && setError(e.message)
    );
    return () => { alive = false; };
  }, []);

  const unread = (data.messages || []).filter((m) => !m.read).length;
  const pendingOrders = (data.orders || []).filter((o) => ["pending", "processing"].includes(o.status)).length;

  return (
    <section className="container-x py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Admin console</p>
          <h1 className="text-4xl font-light md:text-5xl">Greenhouse <em className="text-moss">control room</em></h1>
        </div>
        <div className="flex gap-2">
          <Button to="/" variant="outline" size="sm"><Home className="size-4" /> Back to store</Button>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="size-4" /> Refresh</Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Admin sections">
          {TABS.map(({ k, l, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setParams(k === "overview" ? {} : { tab: k })}
              className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition lg:rounded-2xl ${tab === k ? "bg-forest text-on-forest" : "hover:bg-surface-2"}`}
            >
              <Icon className="size-4" /> {l}
              {k === "messages" && unread > 0 && <span className="ml-auto rounded-full bg-clay px-2 text-xs text-white">{unread}</span>}
              {k === "orders" && pendingOrders > 0 && <span className="ml-auto rounded-full bg-clay px-2 text-xs text-white">{pendingOrders}</span>}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {error ? (
            <EmptyState icon={AlertTriangle} title="Couldn't load admin data" text={error} action={<Button onClick={load}>Try again</Button>} />
          ) : !data.orders ? (
            <div className="grid place-items-center py-24"><Loader2 className="size-8 animate-spin text-moss" /></div>
          ) : (
            <>
              {tab === "overview" && <Overview data={data} go={(k) => setParams({ tab: k })} />}
              {tab === "orders" && <Orders orders={data.orders} onChange={(o) => setData((d) => ({ ...d, orders: d.orders.map((x) => (x._id === o._id ? { ...x, ...o, user: x.user } : x)) }))} />}
              {tab === "products" && <Products />}
              {tab === "coupons" && <Coupons />}
              {tab === "messages" && <Messages messages={data.messages} setMessages={(fn) => setData((d) => ({ ...d, messages: fn(d.messages) }))} />}
              {tab === "customers" && <Customers users={data.users} orders={data.orders} />}
              {tab === "questions" && <Questions />}
              {tab === "subscribers" && <Subscribers />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ data, go }) {
  const { byCategory, loadAll } = useCatalog();
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const live = useMemo(() => data.orders.filter((o) => o.status !== "cancelled"), [data.orders]);
  const revenue = live.reduce((s, o) => s + (o.total || 0) + (o.walletUsed || 0), 0);
  const aov = live.length ? revenue / live.length : 0;
  const lowStock = Object.values(byCategory).flat().filter((p) => p.stock !== null && p.stock <= 5);

  // Revenue for the last 14 days
  const days = useMemo(() => {
    const out = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(start.getTime() - i * 86400000);
      out.push({ d, key: d.toDateString(), total: 0, count: 0 });
    }
    const idx = new Map(out.map((x, i) => [x.key, i]));
    for (const o of live) {
      const k = new Date(o.createdAt).toDateString();
      if (idx.has(k)) {
        out[idx.get(k)].total += (o.total || 0) + (o.walletUsed || 0);
        out[idx.get(k)].count += 1;
      }
    }
    return out;
  }, [live]);
  const max = Math.max(1, ...days.map((d) => d.total));
  const byStatus = STATUSES.map((s) => ({ s, n: data.orders.filter((o) => o.status === s).length }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={IndianRupee} label="Revenue" value={formatINR(revenue)} sub={`${live.length} orders`} />
        <Kpi icon={ShoppingBag} label="Orders" value={data.orders.length} sub={`${byStatus.find((x) => x.s === "pending").n + byStatus.find((x) => x.s === "processing").n} to fulfil`} />
        <Kpi icon={TrendingUp} label="Avg. order" value={formatINR(aov)} sub="Before cancellations" />
        <Kpi icon={Users} label="Customers" value={data.users.length} sub={`${data.users.filter((u) => u.role === "admin").length} admins`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[28px] border border-line p-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl">Revenue · last 14 days</h2>
            <span className="text-sm text-muted">{formatINR(days.reduce((s, d) => s + d.total, 0))}</span>
          </div>
          <div className="flex h-48 items-end gap-1.5" role="img" aria-label="Daily revenue bar chart">
            {days.map((d) => (
              <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="rounded-t-md bg-moss/80 transition group-hover:bg-clay" style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-forest px-2 py-1 text-[11px] whitespace-nowrap text-on-forest group-hover:block">
                  {d.d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {formatINR(d.total)} · {d.count} orders
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{days[0].d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <span>Today</span>
          </div>
        </div>

        <div className="rounded-[28px] border border-line p-6">
          <h2 className="mb-5 text-2xl">Order pipeline</h2>
          <ul className="space-y-3">
            {byStatus.map(({ s, n }) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className={`w-24 rounded-full px-2.5 py-1 text-center text-xs font-bold capitalize ${STATUS_STYLE[s]}`}>{s}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-moss" style={{ width: `${data.orders.length ? (n / data.orders.length) * 100 : 0}%` }} /></div>
                <span className="w-8 text-right font-semibold tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" className="mt-6" onClick={() => go("orders")}>Manage orders</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-line p-6">
          <h2 className="mb-4 text-2xl">Latest orders</h2>
          {data.orders.length === 0 ? <p className="text-sm text-muted">No orders yet.</p> : (
            <ul className="divide-y divide-line">
              {data.orders.slice(0, 6).map((o) => (
                <li key={o._id} className="flex items-center gap-3 py-3 text-sm">
                  <div className="min-w-0 flex-1"><p className="font-semibold">{short(o._id)} · {o.deliveryName || o.user?.name}</p><p className="text-xs text-muted">{formatDate(o.createdAt)}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLE[o.status] || ""}`}>{o.status}</span>
                  <span className="w-20 text-right font-semibold">{formatINR(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-[28px] border border-line p-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl">Low stock {lowStock.length > 0 && <span className="rounded-full bg-clay px-2 text-sm text-white">{lowStock.length}</span>}</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Nothing running low. Stock is only tracked for products where you've set it in <button onClick={() => go("products")} className="font-semibold text-clay">Products & stock</button>.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                  <img src={hdImage(p.image, 100)} data-fallback={fallbackImage(p.category)} alt="" className="size-10 rounded-lg object-cover" />
                  <span className="line-clamp-1 flex-1">{p.name}</span>
                  <span className={`font-bold ${p.stock === 0 ? "text-clay" : ""}`}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-[24px] bg-surface p-5">
      <Icon className="size-5 text-moss" />
      <p className="mt-4 text-xs font-bold tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  );
}

/* ---------------- Orders ---------------- */
function Orders({ orders, onChange }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);

  const list = orders.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (!q) return true;
    const t = q.toLowerCase();
    return [String(o._id), o.deliveryName, o.deliveryEmail, o.deliveryPhone, o.user?.name, o.user?.email].some((v) => String(v || "").toLowerCase().includes(t));
  });

  const update = async (o, body) => {
    setBusy(o._id);
    try {
      const d = await api(`/api/admin/orders/${o._id}/update`, { method: "POST", auth: true, body });
      onChange(d.order);
      if (open?._id === o._id) setOpen((x) => ({ ...x, ...d.order }));
      toast(`Order ${short(o._id)} updated`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <Toolbar q={q} setQ={setQ} placeholder="Search name, email, phone or order #">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field w-auto text-sm" aria-label="Filter by status">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Toolbar>
      {list.length === 0 ? <EmptyState icon={Package} title="No orders match" /> : (
        <div className="overflow-x-auto rounded-[24px] border border-line">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-left text-xs tracking-wider text-muted uppercase">
              <tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((o) => (
                <tr key={o._id} className="hover:bg-surface/60">
                  <td className="p-4"><p className="font-semibold">{short(o._id)}</p><p className="text-xs text-muted">{formatDate(o.createdAt)}</p></td>
                  <td className="p-4"><p>{o.deliveryName || o.user?.name}</p><p className="text-xs text-muted">{o.deliveryEmail || o.user?.email}</p></td>
                  <td className="p-4">{o.items?.reduce((s, i) => s + (i.quantity || 1), 0)} {o.giftMessage && <Gift className="ml-1 inline size-3.5 text-clay" aria-label="Gift order" />}</td>
                  <td className="p-4 font-semibold">{formatINR(o.total)}</td>
                  <td className="p-4"><span className="uppercase">{o.paymentMethod}</span> · <span className={o.paymentStatus === "paid" ? "text-moss" : "text-muted"}>{o.paymentStatus}</span></td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      disabled={busy === o._id || o.status === "cancelled"}
                      onChange={(e) => {
                        const s = e.target.value;
                        if (s === "cancelled" && !window.confirm("Cancel this order? Wallet credits and stock will be returned.")) return;
                        update(o, { status: s });
                      }}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold capitalize outline-none ${STATUS_STYLE[o.status] || ""}`}
                      aria-label={`Status for ${short(o._id)}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4"><button onClick={() => setOpen(o)} className="grid size-9 place-items-center rounded-full hover:bg-surface-2" aria-label="View order"><Eye className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title="Order details" wide>
        {open && (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pr-8">
              <h2 className="font-display text-3xl">{short(open._id)}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[open.status]}`}>{open.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">Placed {formatDate(open.createdAt)} · {open.paymentMethod?.toUpperCase()} · payment {open.paymentStatus}</p>
            <ul className="mt-6 divide-y divide-line rounded-2xl border border-line">
              {open.items?.map((it, i) => (
                <li key={i} className="flex items-center gap-3 p-3 text-sm">
                  <img src={it.image ? hdImage(it.image, 100) : "/images/placeholder.svg"} data-fallback="/images/placeholder.svg" alt="" className="size-12 rounded-lg object-cover" />
                  <span className="flex-1">{it.name} × {it.quantity}</span>
                  <span>{formatINR(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-6 text-sm md:grid-cols-2">
              <div>
                <p className="font-semibold">Ship to</p>
                <p className="mt-1 text-muted">{open.deliveryName}<br />{open.deliveryAddress}<br />{open.deliveryLocation}<br />{open.deliveryPhone} · {open.deliveryEmail}</p>
                {open.giftMessage && <p className="mt-3 rounded-xl bg-clay/10 p-3 text-clay"><Gift className="mr-1 inline size-4" /> “{open.giftMessage}” — hide prices in the parcel</p>}
                {open.giftWrap && <p className="mt-2 rounded-xl bg-clay/10 p-3 text-clay">🎀 Gift wrap requested</p>}
                {open.preferredDate && <p className="mt-2 rounded-xl bg-moss/10 p-3 text-moss">📅 Deliver on {formatDate(open.preferredDate)}{open.preferredSlot ? ` · ${open.preferredSlot}` : ""}</p>}
              </div>
              <dl className="space-y-1">
                <Row l="Subtotal" v={formatINR(open.subtotal)} />
                {open.discount > 0 && <Row l={`Discount ${open.couponCode ? `(${open.couponCode})` : ""}`} v={`−${formatINR(open.discount)}`} />}
                {open.walletUsed > 0 && <Row l="Wallet" v={`−${formatINR(open.walletUsed)}`} />}
                <Row l="GST" v={formatINR(open.tax)} />
                {open.giftWrapFee > 0 && <Row l="Gift wrap" v={formatINR(open.giftWrapFee)} />}
                <Row l="Delivery" v={open.shipping ? formatINR(open.shipping) : "Free"} />
                <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd>{formatINR(open.total)}</dd></div>
              </dl>
            </div>
            {open.statusHistory?.length > 0 && (
              <ol className="mt-6 flex flex-wrap gap-2 text-xs">
                {open.statusHistory.map((h, i) => <li key={i} className="rounded-full bg-surface-2 px-3 py-1 capitalize">{h.status} · {formatDate(h.at)}</li>)}
              </ol>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {open.status !== "cancelled" && open.status !== "delivered" && (
                <Button size="sm" disabled={busy === open._id} onClick={() => update(open, { status: STATUSES[Math.min(3, STATUSES.indexOf(open.status) + 1)] })}>
                  <Check className="size-4" /> Mark as {STATUSES[Math.min(3, STATUSES.indexOf(open.status) + 1)]}
                </Button>
              )}
              {open.paymentStatus !== "paid" && open.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => update(open, { paymentStatus: "paid" })}>Mark paid</Button>}
              <Button size="sm" variant="outline" onClick={() => generateInvoicePDF(open)}><Download className="size-4" /> Invoice</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ l, v }) {
  return <div className="flex justify-between"><dt className="text-muted">{l}</dt><dd>{v}</dd></div>;
}

function Toolbar({ q, setQ, placeholder, children }) {
  return (
    <div className="mb-5 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search" className="field pl-10 text-sm" />
      </div>
      {children}
    </div>
  );
}

/* ---------------- Products & stock ---------------- */
function Products() {
  const { byCategory, loadAll } = useCatalog();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [shown, setShown] = useState(50);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const all = (cat === "all" ? CATEGORIES.flatMap((c) => byCategory[c.slug] || []) : byCategory[cat] || []).map((p) => ({ ...p, ...(overrides[p.id] || {}) }));
  const list = all.filter((p) => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!onlyLow || (p.stock !== null && p.stock <= 5)));

  const save = async (p) => {
    const value = edits[p.id];
    if (value === undefined || value === "") return;
    setSaving(p.id);
    try {
      const d = await api(`/api/admin/plants/${p.id}/update`, { method: "POST", auth: true, body: { stock: Number(value) } });
      setOverrides((o) => ({ ...o, [p.id]: { stock: d.plant.stock } }));
      setEdits((e) => ({ ...e, [p.id]: undefined }));
      toast(`Stock for “${p.name.slice(0, 30)}” set to ${d.plant.stock}`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(null);
    }
  };

  const resync = async () => {
    if (!window.confirm("Re-import products from the CSV files? Prices, names and images will be refreshed.")) return;
    setSyncing(true);
    try {
      await api("/api/admin/plants/resync-csv", { method: "POST", auth: true });
      toast("Catalogue re-synced from CSV — reload to see changes");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <Toolbar q={q} setQ={(v) => { setQ(v); setShown(50); }} placeholder="Search products">
        <select value={cat} onChange={(e) => { setCat(e.target.value); setShown(50); }} className="field w-auto text-sm" aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </select>
        <label className="flex items-center gap-2 rounded-2xl border border-line px-4 text-sm"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="accent-[var(--clay)]" /> Low stock</label>
        <Button variant="outline" size="md" onClick={resync} disabled={syncing}>{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Re-sync CSV</Button>
      </Toolbar>
      <p className="mb-4 text-sm text-muted">{list.length} products · Stock is unlimited until you set a number. Customers who tapped “Notify me” are emailed when a sold-out product gets stock again.</p>
      <div className="overflow-x-auto rounded-[24px] border border-line">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface text-left text-xs tracking-wider text-muted uppercase">
            <tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.slice(0, shown).map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <Link to={`/product/${p.id}`} className="flex items-center gap-3 hover:text-moss">
                    <img src={hdImage(p.image, 100)} data-fallback={fallbackImage(p.category)} alt="" loading="lazy" className="size-11 rounded-lg object-cover" />
                    <span className="line-clamp-2 max-w-sm">{p.name}</span>
                  </Link>
                </td>
                <td className="p-3 text-muted">{categoryBySlug(p.category)?.title}</td>
                <td className="p-3 font-semibold">{formatINR(p.price)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={edits[p.id] ?? (p.stock ?? "")}
                      placeholder="∞"
                      onChange={(e) => setEdits((x) => ({ ...x, [p.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && save(p)}
                      className={`field w-24 py-2 text-sm ${p.stock === 0 ? "border-clay" : ""}`}
                      aria-label={`Stock for ${p.name}`}
                    />
                    {edits[p.id] !== undefined && edits[p.id] !== "" && (
                      <button onClick={() => save(p)} disabled={saving === p.id} className="grid size-9 place-items-center rounded-full bg-forest text-on-forest" aria-label="Save stock">
                        {saving === p.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown < list.length && <div className="mt-6 text-center"><Button variant="outline" onClick={() => setShown((s) => s + 50)}>Show more</Button></div>}
    </div>
  );
}

/* ---------------- Coupons ---------------- */
function Coupons() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [creating, setCreating] = useState(false);
  const empty = { code: "", description: "", type: "percentage", value: 10, maxDiscount: "", minOrderValue: 0, maxUses: "", expiryDate: "", firstOrderOnly: false };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    api("/api/admin/discounts", { auth: true }).then((d) => setList(Array.isArray(d) ? d : [])).catch((e) => toast(e.message, "error"));
  }, [toast]);

  const create = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, code: form.code.trim().toUpperCase(), maxDiscount: form.maxDiscount === "" ? null : form.maxDiscount, maxUses: form.maxUses === "" ? null : form.maxUses };
      const c = await api("/api/admin/discounts", { method: "POST", auth: true, body });
      setList((l) => [c, ...(l || [])]);
      setCreating(false);
      setForm(empty);
      toast(`Coupon ${c.code} created`);
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const toggle = async (c) => {
    try {
      const u = await api(`/api/admin/discounts/${c._id}`, { method: "PUT", auth: true, body: { isActive: !c.isActive } });
      setList((l) => l.map((x) => (x._id === c._id ? u : x)));
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await api(`/api/admin/discounts/${c._id}`, { method: "DELETE", auth: true });
      setList((l) => l.filter((x) => x._id !== c._id));
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  if (!list) return <div className="grid place-items-center py-24"><Loader2 className="size-8 animate-spin text-moss" /></div>;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">{list.length} coupons · Customers' referral codes work automatically and aren't listed here.</p>
        <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> New coupon</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => (
          <div key={c._id} className={`rounded-[24px] border p-5 ${c.isActive ? "border-line" : "border-dashed border-line opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl tracking-wider">{c.code}</p>
                <p className="text-sm text-muted">{c.description || (c.type === "percentage" ? `${c.value}% off` : `${formatINR(c.value)} off`)}</p>
              </div>
              <button onClick={() => remove(c)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-clay" aria-label={`Delete ${c.code}`}><Trash2 className="size-4" /></button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Chip>{c.type === "percentage" ? `${c.value}%` : formatINR(c.value)}{c.maxDiscount ? ` · max ${formatINR(c.maxDiscount)}` : ""}</Chip>
              {c.minOrderValue > 0 && <Chip>Min {formatINR(c.minOrderValue)}</Chip>}
              <Chip>Used {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</Chip>
              {c.firstOrderOnly && <Chip>First order</Chip>}
              {c.expiryDate && <Chip>Until {formatDate(c.expiryDate)}</Chip>}
            </div>
            <button onClick={() => toggle(c)} className="mt-4 text-sm font-semibold text-moss">{c.isActive ? "Pause coupon" : "Activate coupon"}</button>
          </div>
        ))}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New coupon" wide>
        <h2 className="font-display text-3xl">New coupon</h2>
        <form onSubmit={create} className="mt-6 grid gap-4 sm:grid-cols-2">
          <L label="Code"><input required value={form.code} onChange={set("code")} className="field uppercase" placeholder="MONSOON20" /></L>
          <L label="Description"><input value={form.description} onChange={set("description")} className="field" placeholder="20% off for the monsoon" /></L>
          <L label="Type"><select value={form.type} onChange={set("type")} className="field"><option value="percentage">Percentage</option><option value="fixed">Fixed ₹ amount</option></select></L>
          <L label={form.type === "percentage" ? "Percent off" : "Amount off (₹)"}><input required type="number" min="1" value={form.value} onChange={set("value")} className="field" /></L>
          {form.type === "percentage" && <L label="Max discount (₹, optional)"><input type="number" min="0" value={form.maxDiscount} onChange={set("maxDiscount")} className="field" /></L>}
          <L label="Minimum order (₹)"><input type="number" min="0" value={form.minOrderValue} onChange={set("minOrderValue")} className="field" /></L>
          <L label="Max uses (optional)"><input type="number" min="1" value={form.maxUses} onChange={set("maxUses")} className="field" /></L>
          <L label="Expires (optional)"><input type="date" value={form.expiryDate} onChange={set("expiryDate")} className="field" /></L>
          <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" checked={form.firstOrderOnly} onChange={set("firstOrderOnly")} className="size-5 accent-[var(--moss)]" /> Only for a customer's first order</label>
          <Button type="submit" className="sm:col-span-2">Create coupon</Button>
        </form>
      </Modal>
    </div>
  );
}

const Chip = ({ children }) => <span className="rounded-full bg-surface-2 px-3 py-1 font-semibold">{children}</span>;
const L = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>;

/* ---------------- Messages ---------------- */
function Messages({ messages, setMessages }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const list = messages.filter((m) => !q || [m.name, m.email, m.message].some((v) => String(v || "").toLowerCase().includes(q.toLowerCase())));

  const markRead = async (m) => {
    try {
      await api(`/api/admin/messages/${m._id}/mark-read`, { method: "POST", auth: true });
      setMessages((l) => l.map((x) => (x._id === m._id ? { ...x, read: true } : x)));
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const remove = async (m) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api(`/api/admin/messages/${m._id}/delete`, { method: "POST", auth: true });
      setMessages((l) => l.filter((x) => x._id !== m._id));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div>
      <Toolbar q={q} setQ={setQ} placeholder="Search messages" />
      {list.length === 0 ? <EmptyState icon={MessageSquare} title="Inbox zero" text="Messages from the contact form appear here." /> : (
        <ul className="space-y-3">
          {list.map((m) => (
            <li key={m._id} className={`rounded-[24px] border p-5 ${m.read ? "border-line" : "border-moss bg-surface"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.name} {!m.read && <span className="ml-2 rounded-full bg-clay px-2 py-0.5 text-[11px] text-white">New</span>}</p>
                  <p className="text-xs text-muted">{m.email} {m.phone && `· ${m.phone}`} · {formatDate(m.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  {m.email && <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to JeevaLeaf")}`} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:border-ink">Reply</a>}
                  {!m.read && <button onClick={() => markRead(m)} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:border-ink">Mark read</button>}
                  <button onClick={() => remove(m)} className="grid size-8 place-items-center rounded-full text-muted hover:text-clay" aria-label="Delete message"><X className="size-4" /></button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Customers ---------------- */
function Customers({ users, orders }) {
  const [q, setQ] = useState("");
  const stats = useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const id = String(o.user?._id || o.user);
      const s = m.get(id) || { n: 0, spent: 0 };
      if (o.status !== "cancelled") { s.n += 1; s.spent += (o.total || 0) + (o.walletUsed || 0); }
      m.set(id, s);
    }
    return m;
  }, [orders]);
  const list = users.filter((u) => !q || [u.name, u.email, u.phone].some((v) => String(v || "").toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <Toolbar q={q} setQ={setQ} placeholder="Search customers" />
      <div className="overflow-x-auto rounded-[24px] border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-xs tracking-wider text-muted uppercase">
            <tr><th className="p-4">Customer</th><th className="p-4">Joined</th><th className="p-4">Orders</th><th className="p-4">Spent</th><th className="p-4">Wallet</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((u) => {
              const s = stats.get(String(u._id)) || { n: 0, spent: 0 };
              return (
                <tr key={u._id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center overflow-hidden rounded-full bg-sage font-bold text-forest">{u.profilePhoto ? <img src={u.profilePhoto} alt="" className="size-full object-cover" /> : u.name?.[0]}</div>
                      <div><p className="font-semibold">{u.name} {u.role === "admin" && <span className="ml-1 rounded-full bg-forest px-2 py-0.5 text-[10px] text-on-forest">ADMIN</span>}</p><p className="text-xs text-muted">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
                  <td className="p-3">{s.n}</td>
                  <td className="p-3 font-semibold">{formatINR(s.spent)}</td>
                  <td className="p-3">{formatINR(u.walletBalance || 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Newsletter ---------------- */
function Subscribers() {
  const [list, setList] = useState(null);
  const toast = useToast();
  useEffect(() => {
    api("/api/admin/subscribers", { auth: true }).then((d) => setList(d.subscribers || [])).catch((e) => toast(e.message, "error"));
  }, [toast]);

  const exportCsv = () => {
    const csv = "email,subscribed_at\n" + list.map((s) => `${s.email},${new Date(s.createdAt).toISOString()}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `jeevaleaf-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!list) return <div className="grid place-items-center py-24"><Loader2 className="size-8 animate-spin text-moss" /></div>;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">{list.length} subscribers</p>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={!list.length}><Download className="size-4" /> Export CSV</Button>
      </div>
      {list.length === 0 ? <EmptyState icon={Mail} title="No subscribers yet" text="Sign-ups from the footer newsletter form appear here." /> : (
        <ul className="divide-y divide-line rounded-[24px] border border-line">
          {list.map((s) => <li key={s._id} className="flex justify-between p-4 text-sm"><span>{s.email}</span><span className="text-muted">{formatDate(s.createdAt)}</span></li>)}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Product Q&A ---------------- */
function Questions() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    api("/api/admin/questions", { auth: true }).then((d) => setList(d.questions || [])).catch((e) => toast(e.message, "error"));
  }, [toast]);

  const answer = async (q) => {
    const text = (drafts[q.id] ?? q.answer ?? "").trim();
    if (!text) return;
    try {
      const d = await api(`/api/admin/questions/${q.id}/answer`, { method: "POST", auth: true, body: { answer: text } });
      setList((l) => l.map((x) => (x.id === q.id ? { ...x, ...d.question, plant: x.plant } : x)));
      toast("Answer published on the product page");
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const remove = async (q) => {
    if (!window.confirm("Delete this question?")) return;
    await api(`/api/admin/questions/${q.id}`, { method: "DELETE", auth: true }).catch(() => {});
    setList((l) => l.filter((x) => x.id !== q.id));
  };

  if (!list) return <div className="grid place-items-center py-24"><Loader2 className="size-8 animate-spin text-moss" /></div>;
  const shown = list.filter((q) => (filter === "open" ? !q.answer : filter === "answered" ? !!q.answer : true));
  return (
    <div>
      <div className="mb-5 flex gap-2">
        {[["open", "Unanswered"], ["answered", "Answered"], ["all", "All"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === k ? "bg-forest text-on-forest" : "border border-line"}`}>
            {l} {k === "open" && <span className="ml-1 opacity-70">{list.filter((q) => !q.answer).length}</span>}
          </button>
        ))}
      </div>
      {shown.length === 0 ? <EmptyState icon={HelpCircle} title="All caught up" text="Customer questions from product pages appear here." /> : (
        <ul className="space-y-4">
          {shown.map((q) => (
            <li key={q.id} className="rounded-[24px] border border-line p-5">
              <div className="flex items-start gap-3">
                {q.plant && <img src={hdImage(q.plant.image, 100)} data-fallback={fallbackImage(q.plant.category)} alt="" className="size-12 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                  {q.plant && <Link to={`/product/${q.plant.id}`} className="line-clamp-1 text-xs font-semibold text-moss">{q.plant.name}</Link>}
                  <p className="mt-1 font-semibold">{q.question}</p>
                  <p className="text-xs text-muted">{q.name} · {formatDate(q.createdAt)}</p>
                </div>
                <button onClick={() => remove(q)} className="grid size-8 place-items-center rounded-full text-muted hover:text-clay" aria-label="Delete question"><Trash2 className="size-4" /></button>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <textarea rows={2} value={drafts[q.id] ?? q.answer ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))} placeholder="Write an answer…" className="field flex-1 text-sm" aria-label="Answer" />
                <Button size="sm" className="self-end" onClick={() => answer(q)}>{q.answer ? "Update" : "Publish answer"}</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
