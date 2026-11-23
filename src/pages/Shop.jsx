import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, SearchX } from "lucide-react";
import ProductCard, { ProductGridSkeleton } from "../components/ProductCard";
import { Button, EmptyState } from "../components/ui";
import { CATEGORIES, categoryBySlug } from "../lib/catalog";
import { useCatalog } from "../context/CatalogContext";
import { discountPct } from "../lib/format";
import { NEEDS, needBySlug } from "../lib/needs";
import { isBroken } from "../lib/brokenImages";
import { hdImage } from "../lib/format";

const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "bestselling", l: "Best selling" },
  { v: "rating", l: "Top rated" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "discount", l: "Biggest savings" },
  { v: "name", l: "Name A–Z" },
];
const PRICE_BANDS = [
  { v: "", l: "Any price" },
  { v: "0-299", l: "Under ₹300" },
  { v: "300-699", l: "₹300 – ₹699" },
  { v: "700-1499", l: "₹700 – ₹1,499" },
  { v: "1500-", l: "₹1,500 & above" },
];
const PAGE = 24;

// Remount per category so pagination and error state start fresh.
export default function Shop() {
  const { category } = useParams();
  return <ShopView key={category || "all"} category={category} />;
}

function ShopView({ category }) {
  const [params, setParams] = useSearchParams();
  const { byCategory, loadCategory, loadAll, enrich } = useCatalog();
  const [error, setError] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cat = categoryBySlug(category);
  const q = params.get("q") || "";
  const sort = params.get("sort") || "featured";
  const price = params.get("price") || "";
  const sale = params.get("sale") === "1";
  const need = needBySlug(params.get("need"));

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    setShown(PAGE);
  };

  useEffect(() => {
    if (cat) loadCategory(cat.slug).catch(() => setError(true));
    else
      loadAll().then((r) => {
        if (r.every((x) => x.status === "rejected")) setError(true);
      });
  }, [cat, loadCategory, loadAll]);

  const source = cat ? byCategory[cat.slug] : CATEGORIES.some((c) => byCategory[c.slug]) ? CATEGORIES.flatMap((c) => byCategory[c.slug] || []) : undefined;
  const loading = !source && !error;

  const products = useMemo(() => {
    if (!source) return [];
    let list = source.map(enrich).filter((p) => p.price > 0);
    if (need) list = list.filter(need.test);
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t));
    }
    if (price) {
      const [min, max] = price.split("-").map((n) => (n ? Number(n) : null));
      list = list.filter((p) => (min == null || p.price >= min) && (max == null || p.price <= max));
    }
    if (sale) list = list.filter((p) => discountPct(p.price, p.oldPrice) > 0);
    const s = [...list];
    if (sort === "price-asc") s.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") s.sort((a, b) => b.price - a.price);
    else if (sort === "discount") s.sort((a, b) => discountPct(b.price, b.oldPrice) - discountPct(a.price, a.oldPrice));
    else if (sort === "name") s.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "bestselling") s.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    else if (sort === "rating") s.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0));
    else {
      // Featured: deal first, then bestsellers, then products with working photos
      const score = (p) => (p.isDeal ? 1000 : 0) + (p.bestseller ? 100 : 0) + (p.rating ? 10 : 0) + (isBroken(p.image && hdImage(p.image, 700)) ? -500 : 0) + (discountPct(p.price, p.oldPrice) > 0 ? 1 : 0);
      s.sort((a, b) => score(b) - score(a));
    }
    return s;
  }, [source, q, price, sale, sort, need, enrich]);

  const activeFilters = [need && { k: "need", l: need.title }, q && { k: "q", l: `“${q}”` }, price && { k: "price", l: PRICE_BANDS.find((b) => b.v === price)?.l }, sale && { k: "sale", l: "On sale" }].filter(Boolean);

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        {cat && <img src={cat.image} alt="" className="absolute inset-0 size-full object-cover" />}
        <div className={`absolute inset-0 ${cat ? "bg-gradient-to-r from-black/70 via-black/40 to-black/10" : ""}`} />
        <div className={`relative container-x ${cat ? "py-20 text-white md:py-28" : "pt-12 pb-8"}`}>
          <nav className={`mb-6 text-sm ${cat ? "text-white/70" : "text-muted"}`} aria-label="Breadcrumb">
            <Link to="/" className="hover:underline">Home</Link> / <Link to="/shop" className="hover:underline">Shop</Link>
            {cat && <> / <span className={cat ? "text-white" : ""}>{cat.title}</span></>}
          </nav>
          <p className={`mb-3 font-display text-lg italic ${cat ? "text-white/80" : "text-clay"}`}>{cat ? cat.latin : need ? "Curated collection" : "The whole greenhouse"}</p>
          <h1 className="max-w-3xl text-5xl leading-[0.95] font-light md:text-7xl">{cat ? cat.title : need ? need.title : q ? <>Results for <em>“{q}”</em></> : "Shop all"}</h1>
          {!cat && need && <p className="mt-4 max-w-lg text-lg text-muted">{need.blurb}</p>}
          {cat && <p className="mt-5 max-w-lg text-lg text-white/80">{cat.blurb}</p>}
        </div>
      </section>

      {/* Category chips */}
      <div className="sticky top-[72px] z-30 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="container-x flex items-center gap-3 py-3">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            <Chip to={`/shop${params.toString() ? `?${params}` : ""}`} active={!cat}>All</Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.slug} to={`/shop/${c.slug}${params.toString() ? `?${params}` : ""}`} active={cat?.slug === c.slug}>{c.title}</Chip>
            ))}
          </div>
          <button onClick={() => setFiltersOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink lg:hidden">
            <SlidersHorizontal className="size-4" /> Filter
          </button>
          <select value={sort} onChange={(e) => setParam("sort", e.target.value === "featured" ? "" : e.target.value)} className="hidden rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold outline-none lg:block" aria-label="Sort products">
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className={`${filtersOpen ? "fixed inset-0 z-[70] overflow-y-auto bg-bg p-6" : "hidden"} lg:static lg:block lg:p-0`}>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <p className="font-display text-2xl">Filters</p>
            <button onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close filters"><X className="size-5" /></button>
          </div>
          <div className="space-y-8 lg:sticky lg:top-40">
            <div>
              <p className="eyebrow mb-3">Search</p>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <input defaultValue={q} key={q} onKeyDown={(e) => e.key === "Enter" && setParam("q", e.currentTarget.value.trim())} onBlur={(e) => setParam("q", e.target.value.trim())} placeholder="Within results" className="field pl-9 text-sm" aria-label="Search within results" />
              </div>
            </div>
            <div className="lg:hidden">
              <p className="eyebrow mb-3">Sort by</p>
              <div className="space-y-1">
                {SORTS.map((s) => <Radio key={s.v} name="sort" checked={sort === s.v} onChange={() => setParam("sort", s.v === "featured" ? "" : s.v)}>{s.l}</Radio>)}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">Collection</p>
              <div className="space-y-1">
                <Radio name="need" checked={!need} onChange={() => setParam("need", "")}>Everything</Radio>
                {NEEDS.map((n) => <Radio key={n.slug} name="need" checked={need?.slug === n.slug} onChange={() => setParam("need", n.slug)}>{n.title}</Radio>)}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">Price</p>
              <div className="space-y-1">
                {PRICE_BANDS.map((b) => <Radio key={b.v} name="price" checked={price === b.v} onChange={() => setParam("price", b.v)}>{b.l}</Radio>)}
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line p-4">
              <span className="text-sm font-semibold">On sale only</span>
              <input type="checkbox" checked={sale} onChange={(e) => setParam("sale", e.target.checked ? "1" : "")} className="size-5 accent-[var(--clay)]" />
            </label>
            <Button className="w-full lg:hidden" onClick={() => setFiltersOpen(false)}>Show {products.length} results</Button>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-muted">{loading ? "Loading…" : `${products.length} ${products.length === 1 ? "product" : "products"}`}</p>
            {activeFilters.map((f) => (
              <button key={f.k} onClick={() => setParam(f.k, "")} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold">
                {f.l} <X className="size-3" />
              </button>
            ))}
          </div>
          {error ? (
            <EmptyState icon={SearchX} title="The greenhouse is unreachable" text="We couldn't load products. Please check your connection and try again." action={<Button onClick={() => window.location.reload()}>Retry</Button>} />
          ) : loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <EmptyState icon={SearchX} title="Nothing matches yet" text="Try removing a filter or searching for something broader." action={<Button variant="outline" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
                {products.slice(0, shown).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {shown < products.length && (
                <div className="mt-16 flex flex-col items-center gap-4">
                  <p className="text-sm text-muted">Showing {shown} of {products.length}</p>
                  <div className="h-1 w-48 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-moss" style={{ width: `${(shown / products.length) * 100}%` }} /></div>
                  <Button variant="outline" onClick={() => setShown((s) => s + PAGE)}>Load more</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Chip({ to, active, children }) {
  return (
    <Link to={to} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-forest text-on-forest" : "hover:bg-ink/5"}`}>
      {children}
    </Link>
  );
}

function Radio({ name, checked, onChange, children }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${checked ? "bg-surface-2 font-semibold" : "hover:bg-surface-2/60"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-[var(--moss)]" />
      {children}
    </label>
  );
}
