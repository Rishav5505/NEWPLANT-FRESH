import { useEffect, useMemo, useRef, useState } from "react";
import Countdown from "../components/Countdown";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Share2, Sun, Droplets, Gauge, Truck, ShieldCheck, RotateCcw, ChevronDown, Sprout, Loader2, PackageX, BellRing, Flame, TrendingUp, MessageCircleQuestion } from "lucide-react";
import { Button, QtyStepper, Stars, Reveal, EmptyState, Skeleton } from "../components/ui";
import ProductCard from "../components/ProductCard";
import DeliveryEstimate from "../components/DeliveryEstimate";
import RecentlyViewed from "../components/RecentlyViewed";
import BoughtTogether from "../components/BoughtTogether";
import { pushRecent } from "../lib/recent";
import { api } from "../lib/api";
import { toProduct, careHints, categoryBySlug, fallbackImage } from "../lib/catalog";
import { formatINR, hdImage, discountPct, plainText, formatDate } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { findById, byCategory, loadCategory, enrich } = useCatalog();
  const [baseProduct, setProduct] = useState(() => findById(id));
  const product = useMemo(() => enrich(baseProduct), [enrich, baseProduct]);
  const [status, setStatus] = useState(product ? "ok" : "loading");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    setQty(1);
    const cached = findById(id);
    if (cached) {
      setProduct(cached);
      setStatus("ok");
    } else {
      setStatus("loading");
    }
    api(`/api/plants/detail/${id}`)
      .then((d) => {
        setProduct(toProduct(d.plant));
        setStatus("ok");
      })
      .catch(() => !cached && setStatus("missing"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (product?.category) loadCategory(product.category).catch(() => {});
  }, [product?.category, loadCategory]);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} — JeevaLeaf`;
    pushRecent(product);
    return () => { document.title = "JeevaLeaf — Bring life into your home"; };
  }, [product]);

  // Show the sticky mobile buy bar once the main Add button has scrolled out of view.
  const buyRef = useRef(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [status, product?.id, product?.stock]);

  if (status === "loading") {
    return (
      <div className="container-x grid gap-12 py-12 lg:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-40" /></div>
      </div>
    );
  }
  if (status === "missing" || !product) {
    return (
      <div className="container-x py-24">
        <EmptyState icon={PackageX} title="This plant has moved on" text="It may have sold out or been renamed. Let's find you another." action={<Button to="/shop">Browse the shop</Button>} />
      </div>
    );
  }

  const off = discountPct(product.price, product.oldPrice);
  const care = careHints(product.name);
  const cat = categoryBySlug(product.category);
  const description = plainText(product.description);
  const saved = has(product.id);
  const soldOut = product.stock === 0;
  const isLivePlant = ["indoor", "flowering", "outdoor"].includes(product.category) && !/artificial|faux|planter|\bpot\b|seeds?\b|booster|fertili/i.test(product.name);
  const related = (byCategory[product.category] || []).filter((p) => p.id !== product.id && p.image).slice(0, 4);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard", "info");
      }
    } catch {
      /* share cancelled */
    }
  };

  return (
    <>
      <div className="container-x pt-8">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link> / <Link to="/shop" className="hover:text-ink">Shop</Link>
          {cat && <> / <Link to={`/shop/${cat.slug}`} className="hover:text-ink">{cat.title}</Link></>}
        </nav>
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Image with hover zoom */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[32px] bg-surface-2"
            onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
          >
            {product.image && (
              <img
                src={hdImage(product.image, 1400)}
                data-fallback={fallbackImage(product.category)}
                alt={product.name}
                className="size-full object-cover transition-transform duration-300"
                style={{ transform: zoom.on ? "scale(1.8)" : "scale(1)", transformOrigin: `${zoom.x}% ${zoom.y}%` }}
              />
            )}
            {off > 0 && <span className="absolute top-5 left-5 rounded-full bg-clay px-3 py-1.5 text-sm font-bold text-white">Save {off}%</span>}
          </div>
        </div>

        {/* Details */}
        <div className="animate-fade-up">
          {cat && <p className="mb-3 font-display text-clay italic">{cat.latin}</p>}
          <h1 className="text-4xl leading-[1.05] md:text-5xl">{product.name}</h1>
          {product.rating && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
              <Stars value={product.rating} /> {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </a>
          )}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl">{formatINR(product.price)}</span>
            {off > 0 && <span className="text-lg text-muted line-through">{formatINR(product.oldPrice)}</span>}
          </div>
          <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

          {product.isDeal && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-clay px-4 py-3 text-sm text-white">
              <Flame className="size-5" /> <b>Deal of the day</b> — extra 20% off ends in <Countdown to={product.dealEndsAt} compact className="font-bold" />
            </div>
          )}
          {product.soldThisWeek > 0 && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-moss/10 px-3 py-1.5 text-sm font-semibold text-moss">
              <TrendingUp className="size-4" /> {product.soldThisWeek} bought this week
            </p>
          )}

          {care && (
            <div className="mt-8 grid grid-cols-3 gap-3">
              <CareTile icon={Sun} label="Light" value={care.light} />
              <CareTile icon={Droplets} label="Water" value={care.water} />
              <CareTile icon={Gauge} label="Care" value={care.level} />
            </div>
          )}

          {soldOut ? (
            <NotifyMe product={product} />
          ) : (
            <div ref={buyRef} className="mt-8 flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, Math.min(20, q)))} />
              <Button size="lg" className="flex-1" onClick={() => add(product, qty)}>
                Add to basket · {formatINR(product.price * qty)}
              </Button>
            </div>
          )}
          <div className="mt-3 flex gap-3">
            {!soldOut && <Button variant="clay" size="lg" className="flex-1" onClick={() => { add(product, qty); navigate("/checkout"); }}>Buy now</Button>}
            <button onClick={() => toggle(product)} className="grid size-14 place-items-center rounded-full border border-line hover:border-ink" aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}>
              <Heart className={`size-5 ${saved ? "fill-clay text-clay" : ""}`} />
            </button>
            <button onClick={share} className="grid size-14 place-items-center rounded-full border border-line hover:border-ink" aria-label="Share">
              <Share2 className="size-5" />
            </button>
          </div>

          {product.stock > 0 && product.stock <= 5 && <p className="mt-4 text-sm font-semibold text-clay">Only {product.stock} left in the greenhouse</p>}

          {isLivePlant && <AddToGarden product={product} />}

          <DeliveryEstimate />

          <div className="mt-6 grid gap-3 rounded-3xl bg-surface p-5 text-sm sm:grid-cols-3">
            <Perk icon={Truck} t="Free delivery" d="On orders above ₹999" />
            <Perk icon={ShieldCheck} t="Health guarantee" d="48-hour replacement window" />
            <Perk icon={RotateCcw} t="Easy returns" d="On pots & accessories" />
          </div>

          <div className="mt-8 divide-y divide-line border-y border-line">
            <Accordion title={isLivePlant ? "About this plant" : "About this product"} defaultOpen>
              <p className="leading-relaxed whitespace-pre-line text-muted">{description || (isLivePlant ? "A healthy, nursery-fresh plant hand-picked by our team." : "Hand-picked by our team for plant lovers.")}</p>
            </Accordion>
            {isLivePlant && <Accordion title="Care guide">
              <ul className="space-y-2 text-muted">
                <li><b className="text-ink">Light:</b> {care?.light || "Bright, indirect light suits most plants."}</li>
                <li><b className="text-ink">Water:</b> {care?.water || "Water when the top 2–3 cm of soil feels dry."}</li>
                <li><b className="text-ink">First week:</b> Let your plant settle in a spot away from harsh sun and AC drafts. Some leaf drop after travel is normal.</li>
              </ul>
              <Link to="/care" className="mt-3 inline-block font-semibold text-clay">Open the care library →</Link>
            </Accordion>}
            <Accordion title="Delivery & returns">
              <p className="text-muted">Dispatched within 2 business days in breathable packaging. If your plant arrives damaged, send us a photo within 48 hours and we'll replace it.</p>
            </Accordion>
          </div>
        </div>
      </section>

      {isLivePlant && !soldOut && <BoughtTogether product={product} />}

      <ProductReviews productId={product.id} />
      <ProductQA productId={product.id} />

      {related.length > 0 && (
        <section className="container-x py-20">
          <Reveal><h2 className="mb-10 text-4xl">You may also <em className="text-moss">love</em></h2></Reveal>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <RecentlyViewed key={product.id} excludeId={product.id} />

      {/* Sticky buy bar on mobile once the main button scrolls away */}
      {!soldOut && (
        <div className={`fixed inset-x-0 bottom-16 z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-xl transition-all duration-300 md:bottom-0 lg:hidden ${showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
          <div className="flex items-center gap-3">
            <img src={hdImage(product.image, 120)} data-fallback={fallbackImage(product.category)} alt="" className="size-11 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <p className="text-sm text-muted">{formatINR(product.price)}</p>
            </div>
            <Button size="sm" onClick={() => add(product, qty)}>Add to basket</Button>
          </div>
        </div>
      )}
    </>
  );
}

function NotifyMe({ product }) {
  const { user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api("/api/stock-alerts", { method: "POST", body: { email, plantId: product.id } });
      setDone(true);
      toast(d.message);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-8 rounded-3xl bg-surface p-5">
      <p className="flex items-center gap-2 font-semibold"><BellRing className="size-5 text-clay" /> Sold out for now</p>
      {done ? (
        <p className="mt-2 text-sm text-muted">Done — we'll email <b>{email}</b> as soon as it's back.</p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email for restock alert" className="field flex-1 text-sm" />
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Notify me</Button>
        </form>
      )}
    </div>
  );
}

function CareTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <Icon className="size-5 text-moss" />
      <p className="mt-3 text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Perk({ icon: Icon, t, d }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-clay" />
      <div><p className="font-semibold">{t}</p><p className="text-xs text-muted">{d}</p></div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-5 text-left font-semibold" aria-expanded={open}>
        {title}
        <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-6 text-sm">{children}</div>}
    </div>
  );
}

function AddToGarden({ product }) {
  const { user, openAuth } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const add = async () => {
    if (!user) return openAuth("login");
    setBusy(true);
    try {
      await api("/api/garden", { method: "POST", auth: true, body: { name: product.name, image: product.image, productId: product.id } });
      toast("Added to My Garden — we'll remind you when it's thirsty 💧");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button onClick={add} disabled={busy} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:text-clay">
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Sprout className="size-4" />} Already own this? Add it to My Garden for care reminders
    </button>
  );
}

function ProductReviews({ productId }) {
  const { user, openAuth } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [form, setForm] = useState({ rating: 5, text: "" });
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/reviews/product/${productId}`).then((d) => setData(d)).catch(() => {});
  }, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api(`/api/reviews/product/${productId}`, { method: "POST", auth: true, body: form });
      setData((s) => ({ ...s, reviews: [d.review, ...s.reviews], count: s.count + 1 }));
      setWriting(false);
      setForm({ rating: 5, text: "" });
      toast("Thank you for your review 🌿");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reviews" className="border-t border-line bg-surface py-20">
      <div className="container-x grid gap-12 lg:grid-cols-[320px_1fr]">
        <div>
          <p className="eyebrow mb-3">Reviews</p>
          <h2 className="text-4xl">What growers say</h2>
          {data.count > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <span className="font-display text-6xl">{Number(data.average).toFixed(1)}</span>
              <div><Stars value={data.average} /><p className="mt-1 text-sm text-muted">{data.count} reviews</p></div>
            </div>
          )}
          <Button variant="outline" className="mt-8" onClick={() => (user ? setWriting((w) => !w) : openAuth("login"))}>Write a review</Button>
        </div>
        <div>
          {writing && (
            <form onSubmit={submit} className="mb-8 rounded-3xl border border-line bg-bg p-6">
              <p className="mb-2 text-sm font-semibold">Your rating</p>
              <Stars value={form.rating} size="size-7" onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
              <textarea required minLength={10} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} rows={4} placeholder="How is your plant settling in?" className="field mt-4" />
              <Button type="submit" className="mt-4" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Post review</Button>
            </form>
          )}
          {data.reviews.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">No reviews yet — be the first to share how this one is growing.</p>
          ) : (
            <ul className="space-y-4">
              {data.reviews.map((r) => (
                <li key={r.id} className="rounded-3xl bg-bg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-sage font-bold text-forest">{r.name?.[0]}</div>
                      <div>
                        <p className="text-sm font-semibold">{r.name} {r.verified && <span className="ml-1 text-xs font-normal text-moss">· Verified buyer</span>}</p>
                        <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <Stars value={r.rating} size="size-3.5" />
                  </div>
                  <p className="mt-4 leading-relaxed">{r.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductQA({ productId }) {
  const { user, openAuth } = useAuth();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    api(`/api/questions/product/${productId}`).then((d) => setList(d.questions || [])).catch(() => {});
  }, [productId]);

  const ask = async (e) => {
    e.preventDefault();
    if (!user) return openAuth("login");
    setBusy(true);
    try {
      const d = await api(`/api/questions/product/${productId}`, { method: "POST", auth: true, body: { question: text } });
      setText("");
      setAsked(true);
      toast(d.message, "info");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container-x grid gap-10 py-20 lg:grid-cols-[320px_1fr]">
      <div>
        <p className="eyebrow mb-3">Questions & answers</p>
        <h2 className="text-4xl">Ask our <em className="text-moss">plant team</em></h2>
        <p className="mt-3 text-sm text-muted">Wondering about size, sunlight or pets? We answer every question, usually within a day.</p>
      </div>
      <div>
        <form onSubmit={ask} className="flex flex-col gap-3 sm:flex-row">
          <input value={text} onChange={(e) => setText(e.target.value)} required minLength={8} maxLength={500} placeholder="e.g. Will this survive on a west-facing balcony?" aria-label="Your question" className="field flex-1" />
          <Button type="submit" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <MessageCircleQuestion className="size-4" />} Ask</Button>
        </form>
        {asked && <p className="mt-3 text-sm text-moss">Thanks! Your question is with our team — answers appear here.</p>}
        {list.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No questions answered yet. Be the first to ask.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {list.map((q) => (
              <li key={q.id} className="rounded-3xl border border-line p-5">
                <p className="font-semibold"><span className="mr-2 font-display text-clay">Q.</span>{q.question}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted"><span className="mr-2 font-display font-semibold text-moss">A.</span>{q.answer}</p>
                <p className="mt-3 text-xs text-muted">Asked by {q.name} · answered {formatDate(q.answeredAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
