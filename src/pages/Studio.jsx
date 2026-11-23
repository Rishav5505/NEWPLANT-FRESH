import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Link2, Shuffle, RotateCw, Move3d, ShoppingBag } from "lucide-react";
import PlantCanvas from "../components/PlantCanvas";
import { Button } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { PLANTS, POT_COLORS, POT_SHAPES, SIZES } from "../three/PlantStudio";

const SEARCH = { monstera: "monstera", snake: "snake", pothos: "money", cactus: "cactus" };
const SIZE_LABEL = { s: "Small", m: "Medium", l: "Large" };
const pick = (obj, v, d) => (v && Object.prototype.hasOwnProperty.call(obj, v) ? v : d);

export default function Studio() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const canvas = useRef(null);
  const [seed, setSeed] = useState(7);
  const [spin, setSpin] = useState(true);

  const plant = pick(PLANTS, params.get("plant"), "monstera");
  const shape = pick(POT_SHAPES, params.get("shape"), "classic");
  const color = pick(POT_COLORS, params.get("color"), "terracotta");
  const size = pick(SIZES, params.get("size"), "m");
  const cfg = { plant, shape, color, size };
  const config = useMemo(() => ({ plant, shape, color, size, seed }), [plant, shape, color, size, seed]);
  const set = (k, v) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next, { replace: true });
  };

  const download = () => {
    const url = canvas.current?.snapshot();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `jeevaleaf-${cfg.plant}-${cfg.color}.png`;
    a.click();
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link to your design copied", "info");
    } catch {
      toast(window.location.href, "info");
    }
  };
  const surprise = () => {
    const r = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
    setParams({ plant: r(PLANTS), shape: r(POT_SHAPES), color: r(POT_COLORS), size: r(SIZES) }, { replace: true });
    setSeed(Math.floor(Math.random() * 1000));
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,color-mix(in_srgb,var(--sage)_45%,transparent),transparent_60%)]" />
      <div className="relative container-x grid gap-8 py-8 lg:grid-cols-[1.35fr_1fr] lg:py-12">
        {/* Stage */}
        <div className="relative">
          <div className="animate-fade-up mb-4 lg:hidden">
            <p className="eyebrow mb-2">3D Pot Studio</p>
            <h1 className="text-4xl font-light">Design your <em className="text-clay">perfect pair</em></h1>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-[40px] border border-line bg-gradient-to-b from-surface to-surface-2 shadow-2xl lg:aspect-auto lg:h-[calc(100vh-180px)] lg:min-h-[560px]">
            <PlantCanvas
              key={spin ? "spin" : "still"}
              ref={canvas}
              config={config}
              autoRotate={spin}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              fallback={<div className="grid size-full place-items-center p-8 text-center text-muted">Your browser doesn't support 3D graphics. Try a recent Chrome, Edge, Safari or Firefox.</div>}
            />
            <div className="pointer-events-none absolute top-5 left-5 rounded-full bg-bg/80 px-3 py-1.5 text-xs font-semibold text-muted backdrop-blur">
              <Move3d className="mr-1 inline size-3.5" /> Drag to rotate · pinch or scroll to zoom
            </div>
            <div className="absolute right-4 bottom-4 left-4 flex flex-wrap justify-center gap-2">
              <StageBtn onClick={() => setSpin((s) => !s)} icon={RotateCw}>{spin ? "Stop spin" : "Auto-spin"}</StageBtn>
              <StageBtn onClick={surprise} icon={Shuffle}>Surprise me</StageBtn>
              <StageBtn onClick={download} icon={Download}>Save image</StageBtn>
              <StageBtn onClick={copyLink} icon={Link2}>Share</StageBtn>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:py-6">
          <div className="hidden lg:block">
            <p className="eyebrow mb-3">3D Pot Studio</p>
            <h1 className="text-5xl leading-[0.95] font-light">Design your <em className="text-clay">perfect pair.</em></h1>
            <p className="mt-4 text-muted">Pick a plant, choose its home, and spin it around in 3D before you buy.</p>
          </div>

          <Group title="Plant">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PLANTS).map(([k, l]) => (
                <Choice key={k} active={cfg.plant === k} onClick={() => set("plant", k)}>{l}</Choice>
              ))}
            </div>
          </Group>

          <Group title="Pot shape">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(POT_SHAPES).map(([k, l]) => (
                <Choice key={k} active={cfg.shape === k} onClick={() => set("shape", k)}>
                  <PotIcon shape={k} />
                  <span className="mt-1 block text-xs">{l}</span>
                </Choice>
              ))}
            </div>
          </Group>

          <Group title={`Finish · ${POT_COLORS[cfg.color].label}`}>
            <div className="flex flex-wrap gap-3">
              {Object.entries(POT_COLORS).map(([k, c]) => (
                <button
                  key={k}
                  onClick={() => set("color", k)}
                  aria-label={c.label}
                  title={c.label}
                  className={`size-11 rounded-full border-2 shadow-inner transition hover:scale-110 ${cfg.color === k ? "border-ink ring-4 ring-ink/10" : "border-white/60"}`}
                  style={{ background: `radial-gradient(circle at 30% 30%, #ffffff55, transparent 55%), ${c.color}` }}
                />
              ))}
            </div>
          </Group>

          <Group title="Size">
            <div className="inline-flex rounded-full border border-line p-1">
              {Object.keys(SIZES).map((k) => (
                <button key={k} onClick={() => set("size", k)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${cfg.size === k ? "bg-forest text-on-forest" : "hover:bg-ink/5"}`}>{SIZE_LABEL[k]}</button>
              ))}
            </div>
          </Group>

          <div className="mt-8 rounded-[28px] bg-surface p-5">
            <p className="text-sm text-muted">Your combination</p>
            <p className="mt-1 font-display text-2xl">{PLANTS[cfg.plant]} in a {SIZE_LABEL[cfg.size].toLowerCase()} {POT_COLORS[cfg.color].label.toLowerCase()} {POT_SHAPES[cfg.shape].toLowerCase()} pot</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button to={`/shop?q=${SEARCH[cfg.plant]}`}><ShoppingBag className="size-4" /> Shop {PLANTS[cfg.plant]}</Button>
              <Button to="/shop/planters" variant="outline">Browse planters</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ title, children }) {
  return (
    <div className="mt-7">
      <p className="mb-3 text-xs font-bold tracking-[0.2em] text-muted uppercase">{title}</p>
      {children}
    </div>
  );
}

function Choice({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${active ? "border-forest bg-forest text-on-forest" : "border-line hover:border-ink/40"}`}>
      {children}
    </button>
  );
}

function StageBtn({ icon: Icon, children, ...rest }) {
  return (
    <button {...rest} className="inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur transition hover:bg-forest hover:text-on-forest">
      <Icon className="size-3.5" /> {children}
    </button>
  );
}

function PotIcon({ shape }) {
  const d = {
    classic: "M8 6h24l-4 26H12z",
    cylinder: "M10 6h20v26H10z",
    bowl: "M4 14h32c0 10-7 16-16 16S4 24 4 14z",
  }[shape];
  return (
    <svg viewBox="0 0 40 36" className="mx-auto h-8 w-10" aria-hidden="true">
      <path d={d} fill="currentColor" opacity=".85" />
    </svg>
  );
}
