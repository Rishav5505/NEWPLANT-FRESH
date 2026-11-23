import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, PawPrint, Wind, Sparkles } from "lucide-react";
import { Button } from "../components/ui";
import { QUIZ, scoreProfiles } from "../lib/plantProfiles";

export default function PlantFinder() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const done = step >= QUIZ.length;
  const q = QUIZ[step];

  const choose = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTimeout(() => setStep((s) => s + 1), 220);
  };
  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  return (
    <section className="relative min-h-[calc(100vh-110px)] overflow-hidden">
      <img src="/images/hd/texture-fern.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-[0.08]" />
      <div className="relative container-x py-14 md:py-20">
        {step === -1 && (
          <div className="animate-fade-up mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-5">Plant Finder</p>
            <h1 className="text-5xl leading-[0.95] font-light md:text-7xl">Let's find the plant that <em className="text-clay">fits your life.</em></h1>
            <p className="mx-auto mt-6 max-w-lg text-lg text-muted">Four questions. Thirty seconds. A shortlist of plants that will genuinely thrive where you live.</p>
            <Button size="lg" className="mt-10" onClick={() => setStep(0)}>Begin <ArrowRight className="size-4" /></Button>
            <div className="mx-auto mt-16 flex max-w-xl justify-center gap-4">
              {["/images/hd/pothos.jpg", "/images/hd/snake-plant.jpg", "/images/hd/peace-lily.jpg", "/images/hd/spider-plant.jpg"].map((s, i) => (
                <img key={s} src={s} alt="" className={`h-36 w-24 object-cover arch shadow-lg sm:h-44 sm:w-32 ${i % 2 ? "mt-8" : ""}`} />
              ))}
            </div>
          </div>
        )}

        {q && (
          <div key={step} className="animate-fade-up mx-auto max-w-3xl">
            <div className="mb-10 flex items-center gap-4">
              <button onClick={() => setStep((s) => s - 1)} className="grid size-10 place-items-center rounded-full border border-line hover:border-ink" aria-label="Previous question"><ArrowLeft className="size-4" /></button>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-clay transition-all duration-500" style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
              </div>
              <span className="text-sm font-semibold text-muted tabular-nums">{step + 1}/{QUIZ.length}</span>
            </div>
            <h2 className="text-4xl leading-tight md:text-6xl">{q.question}</h2>
            <div className={`mt-10 grid gap-4 ${q.options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {q.options.map((o) => {
                const active = answers[q.key] === o.value;
                return (
                  <button
                    key={String(o.value)}
                    onClick={() => choose(q.key, o.value)}
                    className={`group rounded-[28px] border-2 p-6 text-left transition-all hover:-translate-y-1 ${active ? "border-clay bg-clay/5" : "border-line bg-surface hover:border-ink"}`}
                  >
                    <span className={`mb-8 grid size-9 place-items-center rounded-full border-2 ${active ? "border-clay bg-clay" : "border-line"}`}>
                      {active && <span className="size-2.5 rounded-full bg-white" />}
                    </span>
                    <p className="font-display text-2xl">{o.label}</p>
                    <p className="mt-1 text-sm text-muted">{o.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {done && <Results answers={answers} restart={restart} />}
      </div>
    </section>
  );
}

function Results({ answers, restart }) {
  const picks = scoreProfiles(answers);
  return (
    <div className="animate-fade-up">
      <div className="mx-auto max-w-2xl text-center">
        <Sparkles className="mx-auto size-8 text-clay" />
        <h2 className="mt-4 text-5xl leading-tight md:text-6xl">Your perfect <em className="text-moss">matches</em></h2>
        <p className="mt-4 text-muted">Chosen for your light, routine and household. Tap a plant to shop it.</p>
      </div>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {picks.map((p, i) => (
          <article key={p.id} className="group animate-fade-up rounded-[32px] border border-line bg-surface p-4" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="relative aspect-[4/5] overflow-hidden arch">
              <img src={p.image} alt={p.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-[#f4f1e8] px-4 py-1.5 text-sm font-bold text-[#16301f]">{p.match}% match</span>
              {i === 0 && <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-clay px-3 py-1 text-xs font-bold text-white">Best match</span>}
            </div>
            <div className="p-3 pt-5">
              <h3 className="text-3xl">{p.name}</h3>
              <p className="font-display text-sm text-muted italic">{p.latin}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {p.petSafe && <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-3 py-1 text-moss"><PawPrint className="size-3" /> Pet-safe</span>}
                {p.airPurifier && <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-3 py-1 text-moss"><Wind className="size-3" /> Air purifier</span>}
              </div>
              <Button to={`/shop?q=${encodeURIComponent(p.search)}`} className="mt-6 w-full">Shop {p.name} <ArrowRight className="size-4" /></Button>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button variant="outline" onClick={restart}><RotateCcw className="size-4" /> Retake quiz</Button>
      </div>
    </div>
  );
}
