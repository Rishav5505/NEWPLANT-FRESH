import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, X } from "lucide-react";

const VARIANTS = {
  primary: "bg-forest text-on-forest hover:bg-moss",
  clay: "bg-clay text-white hover:brightness-110",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink/5",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-[#f4f1e8] text-[#16301f] hover:bg-white",
};

export function Button({ to, href, variant = "primary", size = "md", className = "", children, ...rest }) {
  const sizes = { sm: "h-9 px-4 text-sm", md: "h-12 px-6 text-[0.95rem]", lg: "h-14 px-8 text-base" };
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${sizes[size]} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button className={cls} {...rest}>{children}</button>;
}

// Scroll-reveal registry: one shared, rAF-throttled scroll listener. Any pending element whose
// top has reached the viewport (or gone past it, e.g. after a fast fling) becomes visible.
const pending = new Set();
let ticking = false;
const sweep = () => {
  ticking = false;
  const limit = window.innerHeight - 40;
  for (const el of pending) {
    if (el.getBoundingClientRect().top < limit) {
      el.classList.add("is-visible");
      pending.delete(el);
    }
  }
  if (pending.size === 0) window.removeEventListener("scroll", onScroll);
};
const onScroll = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(sweep);
  }
};

// Adds .is-visible when the element scrolls into view.
export function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("is-visible");
      return;
    }
    if (pending.size === 0) window.addEventListener("scroll", onScroll, { passive: true });
    pending.add(el);
    return () => pending.delete(el);
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = "left", action }) {
  return (
    <div className={`mb-10 flex flex-col gap-4 md:mb-14 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-4xl leading-[1.05] font-normal text-ink md:text-5xl">{title}</h2>
        {intro && <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stars({ value = 0, size = "size-4", onChange }) {
  // Read-only stars are plain icons, not buttons
  if (!onChange) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-clay text-clay" : "text-line"}`} />)}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={onChange ? `${n} star${n > 1 ? "s" : ""}` : undefined}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`${size} ${n <= Math.round(value) ? "fill-clay text-clay" : "text-line"}`} />
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`animate-fade-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-surface p-6 shadow-2xl sm:rounded-[28px] sm:p-8 ${wide ? "sm:max-w-3xl" : "sm:max-w-md"}`}>
        <button onClick={onClose} className="absolute top-4 right-4 grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Close">
          <X className="size-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}

export function Marquee({ items, className = "" }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div className="animate-marquee inline-flex gap-10">
        {row.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-10 font-display text-2xl italic md:text-4xl">
            {t}
            <span className="text-clay not-italic">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro, image, children }) {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x grid items-end gap-8 pt-10 pb-12 md:grid-cols-[1.4fr_1fr] md:pt-16 md:pb-16">
        <div className="animate-fade-up">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-5xl leading-[0.95] font-light text-ink md:text-7xl">{title}</h1>
          {intro && <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{intro}</p>}
          {children}
        </div>
        {image && (
          <div className="relative hidden h-64 md:block">
            <img src={image} alt="" className="arch absolute right-0 bottom-0 h-full w-56 object-cover shadow-xl" />
          </div>
        )}
      </div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 grid size-16 place-items-center rounded-full bg-surface-2 text-moss">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="text-2xl">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function QtyStepper({ value, onChange, small = false }) {
  const s = small ? "size-8" : "size-10";
  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button type="button" onClick={() => onChange(value - 1)} className={`${s} grid place-items-center rounded-full hover:bg-ink/5`} aria-label="Decrease quantity">−</button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} className={`${s} grid place-items-center rounded-full hover:bg-ink/5`} aria-label="Increase quantity">+</button>
    </div>
  );
}
