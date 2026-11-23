import { Leaf, HeartHandshake, Recycle, GraduationCap } from "lucide-react";
import { Button, Reveal, SectionHeading } from "../components/ui";
import RishavImg from "../assets/Rishav.jpg";
import VinayImg from "../assets/vinay.jpg";
import SaurabhImg from "../assets/saurabh.jpg";

const TEAM = [
  { name: "Rishav Kumar", role: "Founder & Horticulturist", img: RishavImg },
  { name: "Vinay Badnoriya", role: "Founder & Operations", img: VinayImg },
  { name: "Saurabh Kumar", role: "Co-Founder & Tech Lead", img: SaurabhImg },
];

const VALUES = [
  { icon: Leaf, t: "Nursery-fresh", d: "Every plant is hand-picked and health-checked before it leaves the greenhouse." },
  { icon: GraduationCap, t: "Honest education", d: "Care advice written for real Indian homes — not copied from a catalogue." },
  { icon: Recycle, t: "Kinder packaging", d: "Breathable, plastic-light boxes that protect leaves on long journeys." },
  { icon: HeartHandshake, t: "Here after delivery", d: "Reminders, a care library and a team you can message any time." },
];

export default function About() {
  return (
    <>
      <section className="container-x grid items-end gap-10 pt-12 pb-20 lg:grid-cols-[1.3fr_1fr] lg:pt-20">
        <div className="animate-fade-up">
          <p className="eyebrow mb-5">Our story</p>
          <h1 className="text-5xl leading-[0.92] font-light md:text-[5.5rem]">Buying a plant should feel like <em className="text-clay">bringing home life</em>, not taking a gamble.</h1>
        </div>
        <p className="animate-fade-up text-lg leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
          JeevaLeaf — <em className="font-display">jeeva</em>, life — is a small plant studio built by three founders. We pick healthy plants, pack them with care and stay with you long after delivery.
        </p>
      </section>

      <Reveal className="container-x">
        <div className="grid h-[420px] grid-cols-3 gap-4 md:h-[560px]">
          <img src="/images/hd/shelf.jpg" alt="Plants on a wooden shelf" className="col-span-2 size-full rounded-[32px] object-cover" />
          <div className="grid gap-4">
            <img src="/images/hd/boho.jpg" alt="A cactus in a sunlit boho room" className="size-full rounded-[32px] object-cover" />
            <img src="/images/hd/cactus-row.jpg" alt="A row of cacti" className="size-full rounded-[32px] object-cover" />
          </div>
        </div>
      </Reveal>

      <section className="container-x py-24 md:py-32">
        <Reveal><SectionHeading eyebrow="What we believe" title={<>Plants are <em className="text-moss">living things</em>, not stock.</>} /></Reveal>
        <div className="grid gap-px overflow-hidden rounded-[32px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 80} className="bg-bg p-8">
              <span className="font-display text-sm text-clay italic">0{i + 1}</span>
              <Icon className="mt-6 size-8 text-moss" strokeWidth={1.4} />
              <h3 className="mt-5 text-2xl">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface py-24 md:py-32">
        <div className="container-x">
          <Reveal><SectionHeading eyebrow="The gardeners" title={<>The people behind <em className="text-clay">every leaf</em></>} align="center" /></Reveal>
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 100} className="text-center">
                <div className="mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden arch bg-surface-2">
                  <img src={m.img} alt={m.name} className="size-full object-cover grayscale transition duration-700 hover:grayscale-0" />
                </div>
                <h3 className="mt-6 text-2xl">{m.name}</h3>
                <p className="mt-1 text-sm text-muted">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-4xl leading-tight font-light md:text-6xl">Ready to bring a little <em className="text-moss">jeeva</em> home?</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button to="/shop" size="lg">Shop plants</Button>
            <Button to="/contact" variant="outline" size="lg">Say hello</Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
