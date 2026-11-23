import { useState } from "react";
import { Sun, Droplets, Gauge, PawPrint, Wind, Stethoscope, CloudRain, Snowflake, Flame, ArrowRight } from "lucide-react";
import { PageHeader, Reveal, SectionHeading, Modal, Button } from "../components/ui";
import { PLANT_PROFILES } from "../lib/plantProfiles";

const FILTERS = [
  { k: "all", l: "All plants", fn: () => true },
  { k: "easy", l: "Beginner-friendly", fn: (p) => p.care === 1 },
  { k: "low", l: "Low light", fn: (p) => p.light === 1 },
  { k: "pet", l: "Pet-safe", fn: (p) => p.petSafe },
  { k: "air", l: "Air purifying", fn: (p) => p.airPurifier },
];

const LEVEL = ["", "Low", "Medium", "High"];

const SYMPTOMS = [
  { s: "Yellow lower leaves", cause: "Usually overwatering or poor drainage.", fix: "Let the top 3–5 cm of soil dry before watering again and make sure the pot has a drainage hole." },
  { s: "Brown, crispy tips", cause: "Dry air, salty tap water or underwatering.", fix: "Use filtered or stored water, group plants together for humidity and water a little more consistently." },
  { s: "Drooping, limp leaves", cause: "Thirst — or root rot if the soil is already wet.", fix: "Feel the soil. Dry? Water deeply. Wet and smelly? Repot into fresh, airy mix and trim black roots." },
  { s: "Leggy, stretched stems", cause: "Not enough light.", fix: "Move closer to a bright window and rotate the pot weekly. Pinch back long stems to encourage bushiness." },
  { s: "White cottony spots", cause: "Mealybugs.", fix: "Dab with cotton soaked in rubbing alcohol, then spray diluted neem oil weekly for a month." },
  { s: "Scorched, bleached patches", cause: "Sunburn from harsh afternoon sun.", fix: "Shift to filtered light. Remove badly damaged leaves — new growth will come in healthy." },
];

const SEASONS = [
  { icon: Flame, name: "Summer", months: "Mar – Jun", tips: ["Water early morning or evening", "Shade balcony plants from 12–4 pm sun", "Mulch pots to keep roots cool"] },
  { icon: CloudRain, name: "Monsoon", months: "Jul – Sep", tips: ["Cut watering by half — humidity does the work", "Check drainage holes for blockages", "Watch for fungus gnats and leaf spot"] },
  { icon: Snowflake, name: "Winter", months: "Oct – Feb", tips: ["Water only when soil is truly dry", "Move tropicals away from cold windows", "Pause fertiliser until spring"] },
];

export default function CareLibrary() {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const [symptom, setSymptom] = useState(0);
  const list = PLANT_PROFILES.filter(FILTERS.find((f) => f.k === filter).fn);

  return (
    <>
      <PageHeader eyebrow="Care Library" title={<>Everything we know about <em className="text-moss">keeping plants happy.</em></>} intro="Field notes from our growers — written for Indian homes, Indian seasons and very busy people." image="/images/hd/cat-guides.jpg" />

      <section className="container-x pb-24">
        <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {FILTERS.map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${filter === f.k ? "bg-forest text-on-forest" : "border border-line hover:border-ink"}`}>
              {f.l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <button onClick={() => setActive(p)} className="group block w-full text-left">
                <div className="aspect-[3/4] overflow-hidden arch bg-surface-2">
                  <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-2xl">{p.name}</h3>
                <p className="font-display text-sm text-muted italic">{p.latin}</p>
                <div className="mt-3 flex gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Sun className="size-3.5" />{LEVEL[p.light]}</span>
                  <span className="inline-flex items-center gap-1"><Droplets className="size-3.5" />{LEVEL[p.water]}</span>
                  {p.petSafe && <span className="inline-flex items-center gap-1 text-moss"><PawPrint className="size-3.5" />Pet-safe</span>}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Plant Doctor */}
      <section className="bg-surface py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Plant Doctor" title={<>What is your plant <em className="text-clay">trying to say?</em></>} intro="Pick the symptom you're seeing for a quick diagnosis and a fix you can try today." />
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {SYMPTOMS.map((s, i) => (
                <button key={s.s} onClick={() => setSymptom(i)} className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left font-semibold transition ${symptom === i ? "bg-forest text-on-forest" : "bg-bg hover:bg-surface-2"}`}>
                  {s.s} <ArrowRight className={`size-4 transition ${symptom === i ? "translate-x-1" : "opacity-30"}`} />
                </button>
              ))}
            </div>
            <div key={symptom} className="animate-fade-up rounded-[32px] border border-line bg-bg p-8 md:p-12">
              <Stethoscope className="size-8 text-clay" />
              <p className="eyebrow mt-6">Likely cause</p>
              <p className="mt-2 font-display text-3xl leading-snug">{SYMPTOMS[symptom].cause}</p>
              <p className="eyebrow mt-8">Try this</p>
              <p className="mt-2 text-lg leading-relaxed text-muted">{SYMPTOMS[symptom].fix}</p>
              <p className="mt-8 text-sm text-muted">Still worried? <a href="/contact" className="font-semibold text-clay">Send our plant team a photo →</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Seasons */}
      <section className="container-x py-24">
        <Reveal><SectionHeading eyebrow="The Indian plant year" title={<>Care that follows the <em className="text-moss">seasons</em></>} /></Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {SEASONS.map(({ icon: Icon, name, months, tips }, i) => (
            <Reveal key={name} delay={i * 90} className="rounded-[32px] border border-line p-8">
              <div className="flex items-center justify-between">
                <Icon className="size-8 text-clay" strokeWidth={1.5} />
                <span className="text-xs font-bold tracking-widest text-muted uppercase">{months}</span>
              </div>
              <h3 className="mt-8 text-4xl">{name}</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted">
                {tips.map((t) => <li key={t} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-moss" />{t}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name} wide>
        {active && (
          <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
            <img src={active.image} alt={active.name} className="aspect-[3/4] w-full object-cover arch" />
            <div>
              <p className="font-display text-clay italic">{active.latin}</p>
              <h2 className="mt-1 text-4xl">{active.name}</h2>
              <p className="mt-4 leading-relaxed text-muted">{active.summary}</p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                <Meter icon={Sun} label="Light" v={active.light} />
                <Meter icon={Droplets} label="Water" v={active.water} />
                <Meter icon={Gauge} label="Care" v={active.care} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${active.petSafe ? "bg-moss/10 text-moss" : "bg-clay/10 text-clay"}`}><PawPrint className="size-3" /> {active.petSafe ? "Pet-safe" : "Keep away from pets"}</span>
                {active.airPurifier && <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-3 py-1 text-moss"><Wind className="size-3" /> Air purifier</span>}
              </div>
              <p className="eyebrow mt-8 mb-3">Grower's tips</p>
              <ol className="space-y-3 text-sm">
                {active.tips.map((t, i) => <li key={t} className="flex gap-3"><span className="font-display text-clay">0{i + 1}</span>{t}</li>)}
              </ol>
              <Button to={`/shop?q=${encodeURIComponent(active.search)}`} className="mt-8">Shop {active.name}</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Meter({ icon: Icon, label, v }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <Icon className="mx-auto size-4 text-moss" />
      <div className="mt-2 flex justify-center gap-1">{[1, 2, 3].map((n) => <span key={n} className={`h-1.5 w-4 rounded-full ${n <= v ? "bg-moss" : "bg-line"}`} />)}</div>
      <p className="mt-2 text-muted">{label}</p>
    </div>
  );
}
