import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { toProduct } from "../../lib/catalog";
import { formatINR, hdImage } from "../../lib/format";

const SUGGESTIONS = ["Money plant", "Snake plant", "Jasmine", "Bonsai", "Succulent", "Ceramic pot", "Aloe vera", "Hibiscus"];

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const onQuery = (value) => {
    setQ(value);
    setLoading(value.trim().length >= 2);
  };

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => {
      api(`/api/plants/search/${encodeURIComponent(term)}`)
        .then((d) => setResults((d.plants || []).map(toProduct)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return null;

  const goAll = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-[85] overflow-y-auto bg-bg/97 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Search">
      <div className="container-x py-6">
        <div className="flex justify-end">
          <button onClick={onClose} className="grid size-11 place-items-center rounded-full border border-line hover:bg-ink/5" aria-label="Close search"><X className="size-5" /></button>
        </div>
        <form onSubmit={goAll} className="mx-auto mt-6 max-w-3xl">
          <label className="eyebrow" htmlFor="site-search">Search the greenhouse</label>
          <div className="mt-4 flex items-center gap-4 border-b-2 border-ink pb-3">
            <Search className="size-7 shrink-0 text-muted" />
            <input
              id="site-search"
              ref={inputRef}
              value={q}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Try “money plant”"
              className="min-w-0 flex-1 bg-transparent font-display text-3xl outline-none placeholder:text-muted/50 md:text-5xl"
            />
            {loading && <Loader2 className="size-6 animate-spin text-muted" />}
          </div>
        </form>

        <div className="mx-auto mt-10 max-w-3xl">
          {q.trim().length < 2 ? (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => onQuery(s)} className="rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink">{s}</button>
              ))}
            </div>
          ) : results.length === 0 && !loading ? (
            <p className="text-muted">No plants found for “{q}”. Try a simpler word like “jasmine”.</p>
          ) : (
            <>
              <ul className="grid gap-2 sm:grid-cols-2">
                {results.slice(0, 10).map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.id}`} onClick={onClose} className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-surface-2">
                      <img data-fallback="/images/placeholder.svg" src={hdImage(p.image, 160)} alt="" className="size-16 rounded-xl bg-surface-2 object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-semibold">{p.name}</p>
                        <p className="text-sm text-muted">{formatINR(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {results.length > 0 && (
                <button onClick={goAll} className="mt-6 inline-flex items-center gap-2 font-semibold text-clay">
                  See all results <ArrowRight className="size-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
