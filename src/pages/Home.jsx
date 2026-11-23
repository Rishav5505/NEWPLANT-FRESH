import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Leaf, ShieldCheck, Truck, Sprout, Droplets, Bell, Sparkles, Quote, Star, Flame, Move3d } from "lucide-react";
import { Button, Reveal, SectionHeading, Marquee, Stars } from "../components/ui";
import ProductCard, { ProductGridSkeleton } from "../components/ProductCard";
import RecentlyViewed from "../components/RecentlyViewed";
import Countdown from "../components/Countdown";
import Tilt from "../components/Tilt";

const PlantCanvas = lazy(() => import("../components/PlantCanvas"));
import { NEEDS } from "../lib/needs";
import { formatINR, hdImage, discountPct } from "../lib/format";
import { fallbackImage } from "../lib/catalog";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../lib/catalog";
import { useCatalog } from "../context/CatalogContext";
import { api } from "../lib/api";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="border-y border-line bg-surface py-6 text-ink/80">
        <Marquee items={["Monstera deliciosa", "Jasminum sambac", "Dracaena trifasciata", "Epipremnum aureum", "Ficus lyrata", "Hibiscus rosa-sinensis", "Chlorophytum comosum", "Aloe barbadensis"]} />
      </div>
      <BotanicalIndex />
      <DealOfTheDay />
      <ShopByNeed />
      <Bestsellers />
      <FinderBand />
      <StudioTeaser />
      <GardenPreview />
      <Promises />
      <Reviews />
      <RecentlyViewed title="Pick up where you left off" />
      <Editorial />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x grid items-center gap-12 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pt-14 lg:pb-28">
        <div className="relative z-10">
          <p className="animate-fade-up eyebrow mb-6 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-clay" /> A botanical studio · India
          </p>
          <h1 className="animate-fade-up text-[3.4rem] leading-[0.92] font-light text-ink sm:text-7xl xl:text-[6.6rem]" style={{ animationDelay: "80ms" }}>
            Grow a little <em className="font-normal text-clay">wilder</em>
            <span className="text-moss">.</span>
          </h1>
          <p className="animate-fade-up mt-7 max-w-md text-lg leading-relaxed text-muted" style={{ animationDelay: "160ms" }}>
            Hand-picked plants, honest care advice and reminders that keep them thriving — delivered to your door across India.
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
            <Button to="/shop" size="lg">Shop the greenhouse <ArrowRight className="size-4" /></Button>
            <Button to="/plant-finder" variant="outline" size="lg"><Sparkles className="size-4" /> Find my plant</Button>
          </div>
          <div className="animate-fade-up mt-12 flex items-center gap-8" style={{ animationDelay: "320ms" }}>
            <Stat n="5" l="Collections" />
            <span className="h-10 w-px bg-line" />
            <Stat n="100%" l="Healthy-plant promise" />
            <span className="hidden h-10 w-px bg-line sm:block" />
            <Stat n="Pan-India" l="Delivery" className="hidden sm:block" />
          </div>
        </div>

        <Parallax className="relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[600px]">
          {/* Main arch photo */}
          <Layer depth={10}><div className="animate-fade-up absolute top-0 right-0 h-[88%] w-[78%] overflow-hidden arch shadow-2xl" style={{ animationDelay: "120ms" }}>
            <img src="/images/hd/hero-room.jpg" alt="A bright living room filled with potted plants" className="size-full object-cover" fetchPriority="high" />
          </div></Layer>
          {/* Secondary arch */}
          <Layer depth={28}><div className="animate-fade-up absolute bottom-0 left-0 h-[46%] w-[42%] overflow-hidden arch border-[6px] border-bg shadow-xl" style={{ animationDelay: "260ms" }}>
            <img src="/images/hd/monstera-hands.jpg" alt="Hands holding a potted monstera" className="size-full object-cover" />
          </div></Layer>
          {/* Rotating seal */}
          <Layer depth={40}><div className="absolute top-[8%] left-[2%] grid size-28 place-items-center rounded-full bg-clay text-white shadow-xl sm:size-32">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_18s_linear_infinite]" aria-hidden="true">
              <defs><path id="circ" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
              <text fontSize="9.5" letterSpacing="2.4" fill="currentColor" fontFamily="Manrope" fontWeight="700">
                <textPath href="#circ">HAND-PICKED · DELIVERED WITH CARE · </textPath>
              </text>
            </svg>
            <Leaf className="size-7" />
          </div></Layer>
          {/* Floating card */}
          <Layer depth={34}><div className="animate-float absolute right-[-4px] bottom-[16%] w-56 rounded-3xl border border-line bg-surface/95 p-4 shadow-2xl backdrop-blur sm:right-[-24px]">
            <div className="flex items-center gap-3">
              <img src="/images/hd/snake-plant.jpg" alt="" className="size-12 rounded-2xl object-cover" />
              <div>
                <p className="text-sm font-semibold">Snake Plant</p>
                <p className="font-display text-xs text-muted italic">Low light hero</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2 text-xs">
              <Droplets className="size-3.5 text-moss" /> Next watering in <b>6 days</b>
            </div>
          </div></Layer>
        </Parallax>
      </div>
    </section>
  );
}

function Stat({ n, l, className = "" }) {
  return (
    <div className={className}>
      <p className="font-display text-3xl text-ink">{n}</p>
      <p className="mt-1 text-xs tracking-wide text-muted uppercase">{l}</p>
    </div>
  );
}

function BotanicalIndex() {
  return (
    <section className="container-x py-24 md:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="The botanical index"
          title={<>Five rooms of the <em className="text-moss">greenhouse</em></>}
          intro="Wander through our collections — each one tended, photographed and packed by hand."
          action={<Link to="/shop" className="inline-flex items-center gap-2 font-semibold text-ink hover:text-clay">View everything <ArrowRight className="size-4" /></Link>}
        />
      </Reveal>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.slug} delay={i * 90} className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-auto">
            <Link to={`/shop/${c.slug}`} className={`group block ${i % 2 ? "md:mt-16" : ""}`}>
              <Tilt className="arch" max={10}><div className="relative aspect-[3/4.4] overflow-hidden arch">
                <img src={c.image} alt={c.title} loading="lazy" className="size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <span className="absolute top-6 left-1/2 -translate-x-1/2 font-display text-sm text-white italic">No. {String(i + 1).padStart(2, "0")}</span>
                <span className="absolute right-4 bottom-4 grid size-10 place-items-center rounded-full bg-white/90 text-[#16301f] transition group-hover:rotate-45 group-hover:bg-clay group-hover:text-white">
                  <ArrowUpRight className="size-4" />
                </span>
              </div></Tilt>
              <h3 className="mt-5 text-2xl">{c.title}</h3>
              <p className="font-display text-sm text-muted italic">{c.latin}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Bestsellers() {
  const { byCategory, loadCategory } = useCatalog();
  const [tab, setTab] = useState("indoor");
  const [error, setError] = useState(false);
  const list = byCategory[tab];

  useEffect(() => {
    loadCategory(tab).catch(() => setError(true));
  }, [tab, loadCategory]);

  const picks = (list || [])
    .filter((p) => p.image)
    .slice()
    .sort((a, b) => (b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0) - (a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0))
    .slice(0, 8);

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow="This week in the greenhouse" title={<>Most-loved <em className="text-clay">right now</em></>} />
        </Reveal>
        <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => { setError(false); setTab(c.slug); }}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${tab === c.slug ? "bg-forest text-on-forest" : "border border-line hover:border-ink"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
        {error ? (
          <p className="py-10 text-center text-muted">We couldn't reach the greenhouse right now. Please try again in a moment.</p>
        ) : !list ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {picks.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
        <div className="mt-14 text-center">
          <Button to={`/shop/${tab}`} variant="outline">Explore all {CATEGORIES.find((c) => c.slug === tab)?.title.toLowerCase()} <ArrowRight className="size-4" /></Button>
        </div>
      </div>
    </section>
  );
}

function FinderBand() {
  return (
    <section className="container-x py-24 md:py-32">
      <Reveal className="relative overflow-hidden rounded-[40px] bg-[#16301f] text-[#f4f1e8]">
        <img src="/images/hd/texture-calathea.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-25" />
        <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-20">
          <div>
            <p className="mb-5 text-xs font-bold tracking-[0.22em] text-[#e07a52] uppercase">Plant Finder · 30 seconds</p>
            <h2 className="font-display text-4xl leading-[1.02] font-light md:text-6xl">
              Tell us about your room. <em className="text-[#a9cfa0]">We'll find its plant.</em>
            </h2>
            <p className="mt-6 max-w-md text-[#f4f1e8]/75">
              Four quick questions about light, routine and pets — and we match you with plants that will actually thrive in your space.
            </p>
            <Button to="/plant-finder" variant="light" size="lg" className="mt-9">Start the quiz <ArrowRight className="size-4" /></Button>
          </div>
          <div className="relative hidden h-[420px] lg:block">
            {[
              { src: "/images/hd/peace-lily.jpg", cls: "left-0 top-10 h-72 w-48 -rotate-6", m: "96%" },
              { src: "/images/hd/pothos.jpg", cls: "left-[34%] top-0 h-80 w-52 z-10", m: "91%" },
              { src: "/images/hd/aloe.jpg", cls: "right-0 top-16 h-72 w-48 rotate-6", m: "88%" },
            ].map((c) => (
              <div key={c.src} className={`absolute overflow-hidden arch border-4 border-[#f4f1e8] shadow-2xl ${c.cls}`}>
                <img src={c.src} alt="" className="size-full object-cover" />
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f4f1e8] px-3 py-1 text-xs font-bold whitespace-nowrap text-[#16301f]">{c.m} match</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function GardenPreview() {
  const rows = [
    { name: "Monstera", img: "/images/hd/monstera-hands.jpg", due: "Today", pct: 100 },
    { name: "Peace Lily", img: "/images/hd/peace-lily.jpg", due: "Tomorrow", pct: 80 },
    { name: "Snake Plant", img: "/images/hd/snake-plant.jpg", due: "In 9 days", pct: 35 },
  ];
  return (
    <section className="container-x grid items-center gap-14 pb-24 md:pb-32 lg:grid-cols-2">
      <Reveal className="order-2 lg:order-1">
        <div className="relative mx-auto max-w-md rounded-[32px] border border-line bg-surface p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-display text-2xl">My Garden</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-xs font-bold text-clay"><Bell className="size-3.5" /> 1 thirsty</span>
          </div>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.name} className="flex items-center gap-4 rounded-2xl bg-bg p-3">
                <img src={r.img} alt="" className="size-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm"><b>{r.name}</b><span className={r.pct === 100 ? "font-semibold text-clay" : "text-muted"}>{r.due}</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-2"><div className={`h-full rounded-full ${r.pct === 100 ? "bg-clay" : "bg-moss"}`} style={{ width: `${r.pct}%` }} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <Reveal className="order-1 lg:order-2">
        <p className="eyebrow mb-4">New · My Garden</p>
        <h2 className="text-4xl leading-[1.05] md:text-5xl">A care calendar that <em className="text-moss">remembers for you.</em></h2>
        <p className="mt-5 max-w-lg text-lg text-muted">
          Add the plants you own and JeevaLeaf tracks every watering. One tap to log it, a nudge when someone gets thirsty — so nothing wilts while you're busy living.
        </p>
        <ul className="mt-7 space-y-3 text-sm">
          {["Personal watering schedule for every plant", "Plants from your orders added automatically", "Streaks and history to see what's working"].map((t) => (
            <li key={t} className="flex items-center gap-3"><Sprout className="size-4 text-clay" />{t}</li>
          ))}
        </ul>
        <Button to="/garden" className="mt-9">Start my garden <ArrowRight className="size-4" /></Button>
      </Reveal>
    </section>
  );
}

function Promises() {
  const items = [
    { icon: ShieldCheck, t: "Healthy-plant guarantee", d: "Arrived unwell? Send a photo within 48 hours and we replace it." },
    { icon: Truck, t: "Packed like treasure", d: "Breathable, plastic-light packaging built for Indian roads." },
    { icon: Leaf, t: "Nursery-fresh", d: "Sourced straight from growers, never from a warehouse shelf." },
    { icon: Sprout, t: "Lifetime care help", d: "Message our plant team any time for a diagnosis." },
  ];
  return (
    <section className="border-y border-line">
      <div className="container-x grid divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
        {items.map(({ icon: Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 80} className="border-b border-line px-2 py-10 sm:px-8 lg:border-b-0">
            <Icon className="size-7 text-clay" strokeWidth={1.5} />
            <h3 className="mt-5 text-xl">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Reviews() {
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    api("/api/reviews?limit=12")
      .then((d) => setReviews((d.reviews || []).filter((r) => r.text && r.text.length > 10)))
      .catch(() => setReviews([]));
  }, []);
  if (!reviews || reviews.length === 0) return null;
  return (
    <section className="py-24 md:py-32">
      <div className="container-x">
        <Reveal><SectionHeading eyebrow="From our plant parents" title={<>Notes from <em className="text-clay">happy homes</em></>} /></Reveal>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.slice(0, 6).map((r, i) => (
            <Reveal key={r.id} delay={i * 60} className="mb-5 break-inside-avoid rounded-[28px] border border-line bg-surface p-7">
              <Quote className="size-6 text-sage" />
              <p className="mt-4 font-display text-xl leading-snug">{r.text}</p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-sage font-bold text-forest">
                    {r.avatar ? <img src={r.avatar} alt="" className="size-full object-cover" /> : r.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    {r.verified && <p className="text-xs text-moss">Verified buyer</p>}
                  </div>
                </div>
                <Stars value={r.rating} size="size-3.5" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Editorial() {
  return (
    <section className="container-x pt-8 pb-8">
      <Reveal className="relative overflow-hidden rounded-[40px]">
        <img src="/images/hd/hero-jungle.jpg" alt="A lush indoor jungle of tropical plants" loading="lazy" className="h-[560px] w-full object-cover md:h-[640px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-xl p-8 text-white sm:p-14">
            <Star className="size-6 fill-[#e07a52] text-[#e07a52]" />
            <h2 className="mt-6 font-display text-4xl leading-[1.05] font-light md:text-6xl">
              Every home deserves a <em>little jungle.</em>
            </h2>
            <p className="mt-5 text-white/80">Start with one plant. We'll help you grow the rest — with guides, reminders and a team that genuinely loves leaves.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/shop/indoor" variant="light" size="lg">Shop indoor plants</Button>
              <Button to="/care" size="lg" className="border border-white/40 !bg-transparent !text-white hover:!bg-white/10">Read the care library</Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function DealOfTheDay() {
  const { dealProduct: p } = useCatalog();
  const { add } = useCart();
  if (!p) return null;
  const off = discountPct(p.price, p.oldPrice);
  return (
    <section className="container-x pb-24 md:pb-32">
      <Reveal className="relative overflow-hidden rounded-[40px] bg-[#c2603a] text-white">
        <svg className="absolute -right-24 -bottom-24 size-[420px] opacity-15" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 34c0-10 7-17 17-17 0 10-7 17-17 17Z" fill="#fff" /><path d="M32 40c0-8-6-14-14-14 0 8 6 14 14 14Z" fill="#fff" /></svg>
        <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-14">
          <Link to={`/product/${p.id}`} className="group relative mx-auto block aspect-square w-full max-w-md overflow-hidden rounded-[32px] bg-white/10">
            <img src={hdImage(p.image, 900)} data-fallback={fallbackImage(p.category)} alt={p.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#c2603a]">−{off}%</span>
          </Link>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"><Flame className="size-4" /> Deal of the day</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] font-light md:text-5xl">{p.name}</h2>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-5xl">{formatINR(p.price)}</span>
              <span className="text-xl text-white/60 line-through">{formatINR(p.oldPrice)}</span>
            </div>
            <p className="mt-2 text-sm text-white/75">An extra 20% off — today only. A new plant goes on deal every midnight.</p>
            <p className="mt-8 mb-3 text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Ends in</p>
            <Countdown to={p.dealEndsAt} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="light" size="lg" onClick={() => add(p)}>Add to basket</Button>
              <Button to={`/product/${p.id}`} size="lg" className="border border-white/40 !bg-transparent !text-white hover:!bg-white/10">View details</Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ShopByNeed() {
  return (
    <section className="container-x pb-24 md:pb-32">
      <Reveal>
        <SectionHeading eyebrow="Shop by need" title={<>What does your <em className="text-clay">space</em> need?</>} />
      </Reveal>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {NEEDS.map((n, i) => (
          <Reveal key={n.slug} delay={i * 60}>
            <Link to={`/shop?need=${n.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[28px]">
              <img src={n.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="font-display text-xl leading-tight">{n.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/75">{n.blurb}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// Pointer parallax: sets --mx/--my (−1…1) on the container; each Layer shifts by its depth.
function Parallax({ className, children }) {
  const onMove = (e) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
    e.currentTarget.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = (e) => {
    e.currentTarget.style.setProperty("--mx", 0);
    e.currentTarget.style.setProperty("--my", 0);
  };
  return (
    <div className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}

function Layer({ depth, children }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out motion-reduce:transform-none [&>*]:pointer-events-auto"
      style={{ transform: `translate3d(calc(var(--mx, 0) * ${-depth}px), calc(var(--my, 0) * ${-depth}px), 0)` }}
    >
      {children}
    </div>
  );
}

const SHOWCASE = [
  { plant: "monstera", shape: "classic", color: "terracotta", size: "m", seed: 3 },
  { plant: "snake", shape: "cylinder", color: "ivory", size: "m", seed: 5 },
  { plant: "pothos", shape: "bowl", color: "sage", size: "m", seed: 9 },
  { plant: "cactus", shape: "classic", color: "charcoal", size: "m", seed: 2 },
];

// Auto-cycling 3D preview; three.js only loads once this section scrolls near the viewport.
function StudioTeaser() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setVisible(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setI((x) => (x + 1) % SHOWCASE.length), 4000);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <section ref={ref} className="container-x pb-24 md:pb-32">
      <div className="grid items-center gap-10 overflow-hidden rounded-[40px] border border-line bg-gradient-to-br from-surface to-surface-2 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
        <div className="relative order-2 aspect-square w-full lg:order-1">
          {visible && (
            <Suspense fallback={<div className="grid size-full place-items-center"><div className="size-10 animate-spin rounded-full border-2 border-line border-t-moss" /></div>}>
              <PlantCanvas config={SHOWCASE[i]} interactive={false} className="absolute inset-0" fallback={<img src="/images/hd/monstera-hands.jpg" alt="" className="size-full rounded-[32px] object-cover" />} />
            </Suspense>
          )}
        </div>
        <Reveal className="order-1 lg:order-2">
          <p className="eyebrow mb-4 flex items-center gap-2"><Move3d className="size-4" /> New · 3D Pot Studio</p>
          <h2 className="text-4xl leading-[1.05] md:text-5xl">See it in <em className="text-clay">3D</em> before it comes home.</h2>
          <p className="mt-5 max-w-lg text-lg text-muted">Pair a plant with a pot shape, finish and size, then spin it a full 360°. Save the picture or share the design with someone special.</p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {["4 plants", "3 pot shapes", "6 finishes", "3 sizes"].map((t) => <span key={t} className="rounded-full bg-bg px-3 py-1.5 font-semibold">{t}</span>)}
          </div>
          <Button to="/studio" size="lg" className="mt-9">Open the studio <ArrowRight className="size-4" /></Button>
        </Reveal>
      </div>
    </section>
  );
}
