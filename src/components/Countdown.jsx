import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

// Live hh:mm:ss countdown to a timestamp.
export default function Countdown({ to, compact = false, className = "" }) {
  const target = new Date(to).getTime();
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  if (compact) return <span className={`tabular-nums ${className}`}>{pad(h)}:{pad(m)}:{pad(s)}</span>;
  return (
    <div className={`flex items-center gap-2 ${className}`} role="timer" aria-label={`${h} hours ${m} minutes left`}>
      {[[h, "hrs"], [m, "min"], [s, "sec"]].map(([v, l], i) => (
        <div key={l} className="flex items-center gap-2">
          <div className="min-w-14 rounded-2xl bg-white/10 px-3 py-2 text-center backdrop-blur">
            <p className="font-display text-3xl leading-none tabular-nums">{pad(v)}</p>
            <p className="mt-1 text-[10px] tracking-widest uppercase opacity-70">{l}</p>
          </div>
          {i < 2 && <span className="font-display text-2xl opacity-60">:</span>}
        </div>
      ))}
    </div>
  );
}
