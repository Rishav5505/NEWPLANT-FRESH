import { Link } from "react-router-dom";

export default function Logo({ light = false, className = "" }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="JeevaLeaf home">
      <svg viewBox="0 0 64 64" className="size-9 transition-transform duration-500 group-hover:rotate-[-8deg]" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill={light ? "#f4f1e8" : "var(--forest)"} />
        <path d="M32 50V26" stroke={light ? "#16301f" : "var(--bg)"} strokeWidth="3" strokeLinecap="round" />
        <path d="M32 34c0-10 7-17 17-17 0 10-7 17-17 17Z" fill="#8FB58A" />
        <path d="M32 40c0-8-6-14-14-14 0 8 6 14 14 14Z" fill="#C2603A" />
      </svg>
      <span className={`font-display text-[1.6rem] leading-none tracking-tight ${light ? "text-[#f4f1e8]" : "text-ink"}`}>
        Jeeva<em className="text-clay">leaf</em>
      </span>
    </Link>
  );
}
