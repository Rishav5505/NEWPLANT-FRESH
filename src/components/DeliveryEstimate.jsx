import { useState } from "react";
import { MapPin, Truck } from "lucide-react";

// Rough delivery window from the pincode's region (first digits). Metro cities ship fastest.
// Delhi, Gurugram, Mumbai, Pune, Bengaluru, Chennai, Kolkata, Hyderabad, Ahmedabad
const METRO_PREFIXES = ["11", "12", "40", "41", "56", "60", "70", "50", "38"];
// North-east, J&K, Himachal, Andaman — longer transit
const FAR_PREFIXES = ["18", "19", "17", "78", "79", "74", "73"];

const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

function estimate(pin) {
  const p2 = pin.slice(0, 2);
  const [a, b] = METRO_PREFIXES.includes(p2) ? [2, 4] : FAR_PREFIXES.includes(p2) ? [5, 8] : [3, 6];
  const now = Date.now();
  return `${fmt(new Date(now + a * 86400000))} – ${fmt(new Date(now + b * 86400000))}`;
}

const isPin = (p) => /^[1-9]\d{5}$/.test(p);

export default function DeliveryEstimate() {
  const [pin, setPin] = useState(() => {
    try {
      return localStorage.getItem("jl_pincode") || "";
    } catch {
      return "";
    }
  });
  const [result, setResult] = useState(() => (isPin(pin) ? estimate(pin) : ""));

  const check = (e) => {
    e.preventDefault();
    if (!isPin(pin)) return;
    try {
      localStorage.setItem("jl_pincode", pin);
    } catch {
      /* storage unavailable */
    }
    setResult(estimate(pin));
  };

  return (
    <div className="mt-6 rounded-3xl border border-line p-5">
      <p className="flex items-center gap-2 text-sm font-semibold"><MapPin className="size-4 text-clay" /> Check delivery</p>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <input
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(""); }}
          inputMode="numeric"
          placeholder="Enter pincode"
          aria-label="Pincode"
          className="field flex-1 text-sm"
        />
        <button disabled={!isPin(pin)} className="rounded-full border border-ink/20 px-5 text-sm font-semibold transition hover:border-ink disabled:opacity-40">Check</button>
      </form>
      {result && (
        <p className="mt-3 flex items-center gap-2 text-sm">
          <Truck className="size-4 shrink-0 text-moss" /> Estimated delivery <b>{result}</b>
        </p>
      )}
    </div>
  );
}
